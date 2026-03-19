import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";

  const apiKey = process.env.news_api_key;
  if (!apiKey) {
    return NextResponse.json({ error: "News API key not configured" }, { status: 500 });
  }

  // NewsAPI supports specific languages. 'en' is default.
  const apiLang = "en"; 
  
  const userQuery = searchParams.get("q")?.trim();
  
  // Base agriculture context
  let baseQuery = "agriculture OR farming OR crop OR agri";
  
  // Add regional context for Indian languages
  if (lang === "Hindi" || lang === "Tamil") {
    baseQuery += " India";
  }

  let query: string;
  if (userQuery) {
    // Combine user search with agriculture context so results stay relevant
    // Use the user query as the primary term, combined with agriculture domain
    query = `(${userQuery}) AND (agriculture OR farming OR crop OR agri)`;
  } else {
    query = baseQuery;
  }

  try {
    // Use pageSize=100 to get more comprehensive results
    const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${apiLang}&pageSize=100&sortBy=publishedAt&apiKey=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const data = await response.json();

    if (!response.ok) {
      // If the combined query returns no results, try with just the user query
      if (userQuery && data.totalResults === 0) {
        const fallbackUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(userQuery)}&language=${apiLang}&pageSize=100&sortBy=publishedAt&apiKey=${apiKey}`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        
        if (fallbackRes.ok) {
          const results = mapArticles(fallbackData.articles);
          return NextResponse.json({ results, totalResults: fallbackData.totalResults || 0 });
        }
      }
      return NextResponse.json({ error: data.message || "Failed to fetch news data" }, { status: response.status });
    }

    let articles = data.articles || [];
    
    // If the AND query returned no results, fall back to just the user's query
    if (articles.length === 0 && userQuery) {
      const fallbackUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(userQuery)}&language=${apiLang}&pageSize=100&sortBy=publishedAt&apiKey=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok) {
        articles = fallbackData.articles || [];
      }
    }

    const results = mapArticles(articles);
    return NextResponse.json({ results, totalResults: data.totalResults || results.length });
  } catch (error) {
    console.error("News fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

interface NewsArticle {
  title?: string;
  url?: string;
  source?: { name?: string };
  publishedAt?: string;
  urlToImage?: string;
  description?: string;
}

// Helper to map NewsAPI articles to frontend format, filtering out removed/invalid articles
function mapArticles(articles: NewsArticle[]) {
  return (articles || [])
    .filter((article: NewsArticle) => 
      article.title !== "[Removed]" && 
      article.title && 
      article.url
    )
    .map((article: NewsArticle, index: number) => ({
      id: article.url || index.toString(),
      title: article.title,
      source: { name: article.source?.name || 'News' },
      published_at: article.publishedAt,
      image_url: article.urlToImage,
      description: article.description,
      url: article.url,
    }));
}
