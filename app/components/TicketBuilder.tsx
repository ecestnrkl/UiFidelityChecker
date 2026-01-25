"use client";

import { useState, useMemo } from "react";
import {
  ComparisonResult,
  TicketConfig,
  TicketFormat,
  TicketGranularity,
  Environment,
  Severity,
} from "@/lib/types";
import { generateTickets, generateGitHubIssueURL } from "@/lib/ticketTemplates";

interface TicketBuilderProps {
  result: ComparisonResult;
  selectedMismatches: string[];
}

export default function TicketBuilder({
  result,
  selectedMismatches,
}: TicketBuilderProps) {
  const [format, setFormat] = useState<TicketFormat>("generic-markdown");
  const [granularity, setGranularity] =
    useState<TicketGranularity>("single-bundled");
  const [projectName, setProjectName] = useState("");
  const [environment, setEnvironment] = useState<Environment | "">("");
  const [assignee, setAssignee] = useState("");
  const [labels, setLabels] = useState("");
  const [gitHubRepo, setGitHubRepo] = useState(""); // format: owner/repo

  // Severity mapping state
  const [highSeverity, setHighSeverity] = useState<Severity>("critical");
  const [mediumSeverity, setMediumSeverity] = useState<Severity>("major");
  const [lowSeverity, setLowSeverity] = useState<Severity>("minor");

  const [copyFeedback, setCopyFeedback] = useState("");

  // Build config from current state
  const config: TicketConfig = useMemo(
    () => ({
      format,
      granularity,
      projectName: projectName || undefined,
      screenName: result.metadata.screenName,
      platform: result.metadata.platform as "web" | "mobile" | undefined,
      environment: environment || undefined,
      assignee: assignee || undefined,
      labels: labels ? labels.split(",").map((l) => l.trim()) : undefined,
      severityMapping: {
        high: highSeverity,
        medium: mediumSeverity,
        low: lowSeverity,
      },
    }),
    [
      format,
      granularity,
      projectName,
      environment,
      assignee,
      labels,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      result.metadata.screenName,
      result.metadata.platform,
    ]
  );

  // Generate tickets based on current config
  const tickets = useMemo(
    () => generateTickets(result, selectedMismatches, config),
    [result, selectedMismatches, config]
  );

  const handleCopy = () => {
    if (tickets.length === 0) return;

    // For single ticket, copy content directly
    // For multiple tickets, copy all concatenated with separators
    const content =
      tickets.length === 1
        ? tickets[0].content
        : tickets
            .map((t, idx) => `=== Ticket ${idx + 1}: ${t.title} ===\n\n${t.content}`)
            .join("\n\n" + "=".repeat(80) + "\n\n");

    navigator.clipboard.writeText(content);
    setCopyFeedback("✓ Copied!");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const handleDownload = () => {
    if (tickets.length === 0) return;

    tickets.forEach((ticket) => {
      const blob = new Blob([ticket.content], { type: ticket.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ticket.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleOpenGitHub = () => {
    if (!gitHubRepo || tickets.length === 0) return;

    const [owner, repo] = gitHubRepo.split("/");
    if (!owner || !repo) {
      alert("Please enter GitHub repo in format: owner/repo");
      return;
    }

    const ticket = tickets[0]; // Use first ticket for GitHub
    const url = generateGitHubIssueURL(
      owner,
      repo,
      ticket.title,
      ticket.content,
      config.labels
    );

    window.open(url, "_blank");
  };

  const effectiveSelection =
    selectedMismatches.length > 0 ? selectedMismatches.length : 3;

  return (
    <div
      className="card-terminal"
      style={{
        padding: "32px",
        borderRadius: "16px",
        marginTop: "32px",
      }}
    >
      <h3
        style={{
          fontSize: "28px",
          fontWeight: 900,
          fontFamily: "'Orbitron', sans-serif",
          marginBottom: "24px",
        }}
      >
        <span style={{ color: "var(--accent-cyan)" }}>CREATE</span> TICKETS
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Format Selector */}
        <div>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as TicketFormat)}
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          >
            <option value="generic-markdown">Generic Markdown</option>
            <option value="github-markdown">GitHub Issue Markdown</option>
            <option value="jira-text">Jira Text</option>
            <option value="json">JSON Export</option>
          </select>
        </div>

        {/* Granularity Selector */}
        <div>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Granularity
          </label>
          <select
            value={granularity}
            onChange={(e) =>
              setGranularity(e.target.value as TicketGranularity)
            }
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          >
            <option value="single-bundled">Single Bundled Ticket</option>
            <option value="one-per-mismatch">One Ticket Per Mismatch</option>
          </select>
        </div>

        {/* Project Name */}
        <div>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Project/Repo Name
          </label>
          <input
            type="text"
            placeholder="my-project (optional)"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Environment */}
        <div>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Environment
          </label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as Environment | "")}
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          >
            <option value="">Not specified</option>
            <option value="local">Local</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Assignee
          </label>
          <input
            type="text"
            placeholder="username (optional)"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Labels */}
        <div>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Labels/Tags
          </label>
          <input
            type="text"
            placeholder="bug, ui, design (comma separated)"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          />
        </div>
      </div>

      {/* Severity Mapping */}
      <div style={{ marginTop: "24px" }}>
        <label
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "12px",
            display: "block",
          }}
        >
          Severity Mapping (Priority → Severity)
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#f87171",
                fontWeight: 700,
                minWidth: "80px",
              }}
            >
              High →
            </span>
            <select
              value={highSeverity}
              onChange={(e) => setHighSeverity(e.target.value as Severity)}
              className="input-terminal"
              style={{
                flex: 1,
                minHeight: "40px",
                padding: "8px 12px",
                fontSize: "13px",
                borderRadius: "6px",
              }}
            >
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="trivial">Trivial</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#fbbf24",
                fontWeight: 700,
                minWidth: "80px",
              }}
            >
              Medium →
            </span>
            <select
              value={mediumSeverity}
              onChange={(e) => setMediumSeverity(e.target.value as Severity)}
              className="input-terminal"
              style={{
                flex: 1,
                minHeight: "40px",
                padding: "8px 12px",
                fontSize: "13px",
                borderRadius: "6px",
              }}
            >
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="trivial">Trivial</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#60a5fa",
                fontWeight: 700,
                minWidth: "80px",
              }}
            >
              Low →
            </span>
            <select
              value={lowSeverity}
              onChange={(e) => setLowSeverity(e.target.value as Severity)}
              className="input-terminal"
              style={{
                flex: 1,
                minHeight: "40px",
                padding: "8px 12px",
                fontSize: "13px",
                borderRadius: "6px",
              }}
            >
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="trivial">Trivial</option>
            </select>
          </div>
        </div>
      </div>

      {/* GitHub Repo (only show for GitHub format) */}
      {format === "github-markdown" && (
        <div style={{ marginTop: "24px" }}>
          <label
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              display: "block",
            }}
          >
            GitHub Repository (for "Open in GitHub" link)
          </label>
          <input
            type="text"
            placeholder="owner/repo (e.g., facebook/react)"
            value={gitHubRepo}
            onChange={(e) => setGitHubRepo(e.target.value)}
            className="input-terminal"
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          />
        </div>
      )}

      {/* Preview Info */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "rgba(0, 255, 136, 0.05)",
          border: "1px solid rgba(0, 255, 136, 0.2)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "var(--accent-neon)" }}>
            Preview:
          </strong>{" "}
          {granularity === "single-bundled"
            ? `1 bundled ticket`
            : `${effectiveSelection} separate tickets`}{" "}
          with {effectiveSelection} selected finding
          {effectiveSelection !== 1 ? "s" : ""}{" "}
          {selectedMismatches.length === 0 && "(top 3 by priority)"}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleCopy}
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--accent-neon)",
            color: "#000",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Orbitron', sans-serif",
            position: "relative",
          }}
        >
          {copyFeedback || `COPY ${granularity === "single-bundled" ? "TICKET" : "TICKETS"}`}
        </button>

        <button
          onClick={handleDownload}
          style={{
            padding: "12px 24px",
            border: "2px solid var(--accent-cyan)",
            backgroundColor: "transparent",
            color: "var(--accent-cyan)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontWeight: 700,
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          DOWNLOAD {granularity === "single-bundled" ? "FILE" : "FILES"}
        </button>

        {format === "github-markdown" && gitHubRepo && (
          <button
            onClick={handleOpenGitHub}
            style={{
              padding: "12px 24px",
              border: "2px solid var(--accent-pink)",
              backgroundColor: "transparent",
              color: "var(--accent-pink)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 700,
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            OPEN IN GITHUB →
          </button>
        )}
      </div>
    </div>
  );
}
