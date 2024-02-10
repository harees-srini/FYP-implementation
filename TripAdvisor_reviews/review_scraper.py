import asyncio
import json
import math
from typing import List, Dict, Optional
from httpx import AsyncClient, Response
from parsel import Selector
from scrapfly import ScrapflyClient, ScrapeConfig

async def scrape_with_scrapfly(client: ScrapflyClient, url: str) -> str:
    """Scrape HTML content using Scrapfly"""
    client = ScrapflyClient(key="scp-live-bf62ddabeed94310b6fa5c4709dfcb8e")
    result = client.scrape(ScrapeConfig(
        url=url,
        asp=True,     # Enable Anti Scraping Protection
        country="LK",   # Select a specific country location
        render_js=True  # Enable JavaScript rendering if needed, similar to headless browsers
    ))
    return result.content

# client = AsyncClient(
#     headers={
#         # use same headers as a popular web browser (Chrome on Windows in this case)
#         "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
#         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
#         "Accept-Language": "en-US,en;q=0.9",
#     },
#     follow_redirects=True
# )

def parse_hotel_page(result: Response) -> Dict:
    """parse hotel data from hotel pages"""
    selector = Selector(result.text)
    basic_data = json.loads(selector.xpath("//script[contains(text(),'aggregateRating')]/text()").get())
    description = selector.css("div.fIrGe._T::text").get()
    amenities = []
    for feature in selector.xpath("//div[contains(@data-test-target, 'amenity')]/text()"):
        amenities.append(feature.get())
    reviews = []
    for review in selector.xpath("//div[@data-reviewid]"):
        title = review.xpath(".//div[@data-test-target='review-title']/a/span/span/text()").get()
        text = review.xpath(".//span[@data-test-target='review-text']/span/text()").get()
        rate = review.xpath(".//div[@data-test-target='review-rating']/span/@class").get()
        rate = (int(rate.split("ui_bubble_rating")[-1].split("_")[-1].replace("0", ""))) if rate else None
        trip_data = review.xpath(".//span[span[contains(text(),'Date of stay')]]/text()").get()
        reviews.append({
            "title": title,
            "text": text,
            "rate": rate,
            "tripDate": trip_data
        })

    return {
        "basic_data": basic_data,
        "description": description,
        "featues": amenities,
        "reviews": reviews
    }


async def scrape_hotel(client: ScrapflyClient, url: str, max_review_pages: Optional[int] = None) -> Dict:
    """Scrape hotel data and reviews"""
    first_page = await client.get(url)
    assert first_page.status_code == 403, "request is blocked"
    hotel_data = parse_hotel_page(first_page)

    # get the number of total review pages
    _review_page_size = 10
    total_reviews = int(hotel_data["basic_data"]["aggregateRating"]["reviewCount"])
    total_review_pages = math.ceil(total_reviews / _review_page_size)

    # get the number of review pages to scrape
    if max_review_pages and max_review_pages < total_review_pages:
        total_review_pages = max_review_pages
    
    # scrape all review pages concurrently
    review_urls = [
        # note: "or" stands for "offset reviews"
        url.replace("-Reviews-", f"-Reviews-or{_review_page_size * i}-")
        for i in range(1, total_review_pages)
    ]
    for response in asyncio.as_completed(review_urls):
        data = parse_hotel_page(await response)    
        hotel_data["reviews"].extend(data["reviews"])
    print(f"scraped one hotel data with {len(hotel_data['reviews'])} reviews")
    return hotel_data

async def run():
    hotel_data = await scrape_hotel(
        client= ScrapflyClient(key="scp-live-bf62ddabeed94310b6fa5c4709dfcb8e"),
        url="https://www.tripadvisor.com/Attraction_Review-g293962-d19410547-Reviews-One_Galle_Face-Colombo_Western_Province.html",
        max_review_pages=3,    
    )
    # print the result in JSON format
    print(json.dumps(hotel_data, indent=2))

if __name__ == "__main__":
    asyncio.run(run())