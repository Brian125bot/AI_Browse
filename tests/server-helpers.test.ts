import { describe, it, expect } from "vitest";
import { parseGoogleUrl } from "../server";

describe("Google URL Interceptor Parsing", () => {
  it("should handle empty physical inputs and null values safely", () => {
    // @ts-ignore
    expect(parseGoogleUrl(null)).toEqual({ isGoogle: false, isSearch: false, query: "" });
    expect(parseGoogleUrl("")).toEqual({ isGoogle: false, isSearch: false, query: "" });
    expect(parseGoogleUrl("   ")).toEqual({ isGoogle: false, isSearch: false, query: "" });
  });

  it("should identify domestic Google Homepage routes without search queries", () => {
    const res = parseGoogleUrl("https://www.google.com");
    expect(res.isGoogle).toBe(true);
    expect(res.isSearch).toBe(false);
  });

  it("should parse standard google.com search queries with 'q' parameter in URL", () => {
    const res = parseGoogleUrl("https://www.google.com/search?q=vitest+testing+framework&oq=vitest");
    expect(res.isGoogle).toBe(true);
    expect(res.isSearch).toBe(true);
    expect(res.query).toBe("vitest testing framework");
  });

  it("should parse international Google Search gateways (co.uk, de, ca, fr)", () => {
    const ukRes = parseGoogleUrl("https://google.co.uk/search?q=London+Weather");
    expect(ukRes.isGoogle).toBe(true);
    expect(ukRes.isSearch).toBe(true);
    expect(ukRes.query).toBe("London Weather");

    const deRes = parseGoogleUrl("https://www.google.de/search?q=Fussball");
    expect(deRes.isGoogle).toBe(true);
    expect(deRes.isSearch).toBe(true);
    expect(deRes.query).toBe("Fussball");

    const caRes = parseGoogleUrl("google.ca/search?q=Maple+Leafs");
    expect(caRes.isGoogle).toBe(true);
    expect(caRes.isSearch).toBe(true);
    expect(caRes.query).toBe("Maple Leafs");
  });

  it("should fall back to standard 'Google Search' title query when search parameter is absent", () => {
    const res = parseGoogleUrl("https://google.com/search");
    expect(res.isGoogle).toBe(true);
    expect(res.isSearch).toBe(true);
    expect(res.query).toBe("Google Search");
  });

  it("should reject non-Google domain configurations cleanly", () => {
    const githubRes = parseGoogleUrl("https://github.com/search?q=google");
    expect(githubRes.isGoogle).toBe(false);
    expect(githubRes.isSearch).toBe(false);
    expect(githubRes.query).toBe("");

    const newsYcRes = parseGoogleUrl("https://news.ycombinator.com");
    expect(newsYcRes.isGoogle).toBe(false);
    expect(newsYcRes.isSearch).toBe(false);
  });

  it("should automatically normalize URLs omitting protocols", () => {
    const res = parseGoogleUrl("www.google.com/search?q=normalization");
    expect(res.isGoogle).toBe(true);
    expect(res.isSearch).toBe(true);
    expect(res.query).toBe("normalization");
  });
});
