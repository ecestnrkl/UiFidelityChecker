import { generateTickets, generateGitHubIssueURL } from "../lib/ticketTemplates.js";
import type {
  ComparisonResult,
  TicketConfig,
} from "../lib/types.js";

// Simple test runner
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error}`);
    process.exit(1);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// Mock comparison result
const mockResult: ComparisonResult = {
  diffImageUrl: "data:image/png;base64,mock",
  similarity: 87.5,
  mismatches: [
    {
      id: "mismatch-1",
      title: "Button color mismatch",
      category: "color",
      priority: "high",
      explanation: "Submit button uses #007bff instead of #0056b3",
      suggestedFix: "Update button background-color to #0056b3",
      bbox: { x: 100, y: 200, width: 120, height: 40 },
    },
    {
      id: "mismatch-2",
      title: "Heading font weight incorrect",
      category: "typography",
      priority: "medium",
      explanation: "H1 uses font-weight 400 instead of 700",
      suggestedFix: "Update H1 font-weight to 700",
      bbox: { x: 50, y: 50, width: 300, height: 60 },
    },
    {
      id: "mismatch-3",
      title: "Card spacing too tight",
      category: "spacing",
      priority: "low",
      explanation: "Card padding is 8px instead of 16px",
      suggestedFix: "Update card padding to 16px",
      bbox: { x: 200, y: 300, width: 400, height: 200 },
    },
  ],
  metadata: {
    screenName: "Login Page",
    platform: "web",
    comparedAt: "2026-01-25T10:00:00.000Z",
  },
};

console.log("\nTicket Template Generation");

test("should generate single bundled ticket", () => {
  const config: TicketConfig = {
    format: "generic-markdown",
    granularity: "single-bundled",
    projectName: "MyApp",
    screenName: "Login Page",
    platform: "web",
    environment: "staging",
  };

  const tickets = generateTickets(mockResult, ["mismatch-1", "mismatch-2"], config);

  assert(tickets.length === 1, "Should generate 1 ticket");
  assert(tickets[0].title.includes("Login Page"), "Title should include screen name");
  assert(tickets[0].content.includes("Button color mismatch"), "Should include first mismatch");
  assert(tickets[0].filename.endsWith(".md"), "Filename should end with .md");
});

test("should generate one ticket per mismatch", () => {
  const config: TicketConfig = {
    format: "generic-markdown",
    granularity: "one-per-mismatch",
  };

  const tickets = generateTickets(mockResult, ["mismatch-1", "mismatch-2"], config);

  assert(tickets.length === 2, "Should generate 2 tickets");
  assert(tickets[0].content.includes("Button color mismatch"), "First ticket should include first mismatch");
  assert(!tickets[0].content.includes("Heading font weight incorrect"), "First ticket should not include second mismatch");
});

test("should default to top 3 by priority", () => {
  const config: TicketConfig = {
    format: "generic-markdown",
    granularity: "single-bundled",
  };

  const tickets = generateTickets(mockResult, [], config);

  assert(tickets.length === 1, "Should generate 1 ticket");
  assert(tickets[0].content.includes("Button color mismatch"), "Should include high priority");
});

console.log("\nTemplate Formats");

test("Generic Markdown should contain required sections", () => {
  const config: TicketConfig = {
    format: "generic-markdown",
    granularity: "single-bundled",
  };

  const tickets = generateTickets(mockResult, ["mismatch-1"], config);
  const content = tickets[0].content;

  assert(content.includes("# [UI Fidelity]"), "Should include title");
  assert(content.includes("## Context"), "Should include Context section");
  assert(content.includes("## Summary"), "Should include Summary section");
  assert(content.includes("87.5%"), "Should include similarity percentage");
});

test("GitHub Markdown should contain GitHub sections", () => {
  const config: TicketConfig = {
    format: "github-markdown",
    granularity: "single-bundled",
    assignee: "johndoe",
    labels: ["bug", "ui"],
  };

  const tickets = generateTickets(mockResult, ["mismatch-1"], config);
  const content = tickets[0].content;

  assert(content.includes("### Expected vs Actual"), "Should include Expected vs Actual");
  assert(content.includes("@johndoe"), "Should include assignee");
  assert(content.includes("bug, ui"), "Should include labels");
});

test("Jira Text should use Jira format", () => {
  const config: TicketConfig = {
    format: "jira-text",
    granularity: "single-bundled",
  };

  const tickets = generateTickets(mockResult, ["mismatch-1"], config);
  const content = tickets[0].content;

  assert(content.includes("Summary:"), "Should include Summary");
  assert(content.includes("*Reproduction Steps*"), "Should include Reproduction Steps");
  assert(tickets[0].mimeType === "text/plain", "MIME type should be text/plain");
});

test("JSON export should be valid JSON", () => {
  const config: TicketConfig = {
    format: "json",
    granularity: "single-bundled",
  };

  const tickets = generateTickets(mockResult, ["mismatch-1"], config);
  const json = JSON.parse(tickets[0].content);

  assert("schema" in json, "Should have schema property");
  assert("ticket" in json, "Should have ticket property");
  assert(tickets[0].mimeType === "application/json", "MIME type should be application/json");
});

console.log("\nGitHub Issue URL");

test("should generate valid GitHub issue URL", () => {
  const url = generateGitHubIssueURL(
    "facebook",
    "react",
    "UI Bug",
    "Body text",
    ["bug"]
  );

  assert(url.includes("https://github.com/facebook/react/issues/new"), "Should include base URL");
  assert(url.includes("title=UI+Bug"), "Should include encoded title");
  assert(url.includes("labels=bug"), "Should include labels");
});

console.log("\n✅ All ticket template tests passed!\n");
