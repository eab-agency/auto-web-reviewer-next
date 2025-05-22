import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Check for h2 headings to determine the project type
    const projectType = await page.evaluate(() => {
      // Check for headings with specific text
      const headings = Array.from(
        document.querySelectorAll("h2, h1, .heading")
      );

      for (const heading of headings) {
        const text = heading.textContent?.trim().toLowerCase() || "";

        // Check for Student Journey
        if (
          text.includes("student journey") ||
          text.includes("student-journey") ||
          text.includes("sj")
        ) {
          return "SJ";
        }

        // Check for Paid Search
        if (
          text.includes("paid search") ||
          text.includes("paid-search") ||
          text.includes("ps")
        ) {
          return "PS";
        }

        // Check for DIQ
        if (
          text.includes("deposit intention questionnaire") ||
          text.includes("diq") ||
          text.includes("deposit intention")
        ) {
          return "DIQ";
        }
      }

      // Check for URL patterns if no heading match
      const currentUrl = window.location.href.toLowerCase();

      if (currentUrl.includes("/diq-") || currentUrl.includes("/diq/")) {
        return "DIQ";
      }

      if (
        currentUrl.includes("/apply") ||
        currentUrl.includes("/guide") ||
        currentUrl.includes("/request") ||
        currentUrl.includes("/explore")
      ) {
        return "SJ";
      }

      if (currentUrl.includes("/ps-") || currentUrl.includes("/paidsearch")) {
        return "PS";
      }

      return null;
    });

    await browser.close();

    if (projectType) {
      return NextResponse.json({
        projectType,
        message: `Detected project type: ${projectType}`,
      });
    } else {
      return NextResponse.json(
        { message: "Could not detect project type" },
        { status: 404 }
      );
    }
  } catch (err) {
    const error = err as Error;
    console.error(error);
    return NextResponse.json(
      { error: "Failed to detect project type", message: error.message },
      { status: 500 }
    );
  }
}
