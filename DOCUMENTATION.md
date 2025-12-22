# Website Checker Prototype Documentation

## 1. Overview

Website Checker is an AI-powered web application designed to analyze any website and evaluate its content, structure, and design against plain language standards. Users can enter a URL to receive a comprehensive report that provides a main "Clarity Score" and a detailed breakdown of various metrics, helping them improve the accessibility and readability of their content.

The application is built with Next.js, TypeScript, and Tailwind CSS. The core analysis is powered by a Genkit AI flow that scrapes and evaluates website content.

---

## 2. Core Features

### 2.1. Website Analysis Engine

The user provides a URL through a simple form. The backend then initiates an AI-driven analysis process.

- **How it Works**:
  - The user submits a URL on the homepage.
  - The `getClarityAnalysis` server action is called, which in turn invokes the `analyzePlainLanguage` AI flow.
  - The AI model is prompted to act as a web scraper and a plain language expert. It fetches the content from the given URL and performs a multi-faceted analysis based on a detailed set of instructions.
  - The AI returns a structured JSON object (`PlainLanguageAnalysisOutput`) containing scores, metrics, feedback, and structured data.

### 2.2. The Clarity Report Dashboard

Once the analysis is complete, the user is presented with a multi-tabbed dashboard.

#### **Overall Score**
- **Feature**: At the top of the report is the **Overall Score**, a single, prominent metric from 0-100 that summarizes the site's performance.
- **How it's Calculated**: This score is a weighted average of three sub-scores:
  - **Text Clarity**: 50%
  - **Structural Clarity**: 25%
  - **Visual Clarity**: 25%
- The score is displayed in a large radial gauge chart, color-coded for quick interpretation (Good, Fair, Poor).

#### **Dashboard Tabs**

The dashboard is organized into five main tabs for detailed exploration:

**A. Summary Tab**
- **Purpose**: Provides a high-level overview of the most critical scannability and writing style metrics.
- **Components**:
  - **Scannability & Flow**:
    - **Scannability Score**: A gauge chart showing a score based on average paragraph length.
    - **Logical Flow Feedback**: AI-generated text assessing if the content's key message is clear and logically structured.
    - **"Walls of Text"**: Identifies and summarizes paragraphs that are too long.
    - **Heading-Content Mismatches**: Flags headings where the content below may not be relevant.
  - **Voice & Tone**: Displays the primary detected tone (e.g., "Formal," "Conversational") and includes gauge charts for "Tone Confidence" and "Tone Consistency."

**B. Principles Tab**
- **Purpose**: Evaluates the website against 14 core plain language principles in a clear checklist format.
- **Components**:
  - **Plain Language Principles Checklist**: An accordion list where each item represents a principle (e.g., "Use Short Sentences," "Avoid Jargon").
    - Each principle is marked with a check or 'x' icon to indicate if it was met.
    - A progress bar at the top provides a visual summary of how many principles were satisfied.
    - Expanding an item reveals the AI's one-sentence reasoning for its evaluation.

**C. Statistics Tab**
- **Purpose**: A central location for all the key quantitative data and benchmarks.
- **Components**:
  - **Report Summary**: A strip of key metrics, including Grade Level, Word Count, Sentence Count, and more.
  - **Readability Benchmark**: A crucial table that compares the site's scores for `Grade Level`, `Avg. Sentence Length`, and `Flesch Reading Ease` against ideal plain language targets.
  - **Readability Scores**: A bar chart visualizing standard readability indices (Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog Index).
  - **Voice and Tone Analysis**: A pie chart showing the distribution of Active vs. Passive voice.

**D. Clarity Breakdown Tab**
- **Purpose**: Provides a detailed, score-based breakdown of the three main pillars of clarity, plus vocabulary and design analysis.
- **Components**:
  - **Category Score Cards**: Individual cards for:
    - **Text Clarity**: Score, progress bar, and AI feedback.
    - **Structural Clarity**: Includes feedback on heading hierarchy and list usage.
    - **Visual Clarity**: Provides stats on image alt-text and flags ambiguous icons or link text.
    - **Non-Native Readability**: A score and feedback on how understandable the content is for non-native speakers.
  - **Vocabulary & Sentence Structure**: Shows counts for long sentences and "Hard Words" (complex words with 3+ syllables) and lists detected jargon and repetitive words.
  - **Layout & Design**: Checks for the presence of a mobile viewport tag and provides feedback.

**E. Integrity Tab**
- **Purpose**: Focuses on content originality, bias, and internal consistency.
- **Components**:
  - **Content Integrity Gauges**:
    - **AI Content Probability**: Estimates the likelihood that the content was AI-generated.
    - **Plagiarism Detected**: Estimates the percentage of content matching public sources.
  - **Bias & Inclusivity**: An alert that flags potentially biased or non-inclusive language.
  - **Internal Redundancy**: Lists sentences or phrases that are repeated within the content.

---

## 3. AI and Data Flow

The "brain" of the application is the `plain-language-analysis.ts` Genkit flow.

1.  **Input**: The flow takes a `PlainLanguageAnalysisInput` object, which primarily contains the URL to be analyzed.
2.  **Prompt**: A detailed prompt instructs the `googleai/gemini-2.5-flash` model to perform a series of tasks:
    - Scrape the content from the URL.
    - Analyze text, structure, and visual elements.
    - Calculate over 40 distinct metrics.
    - Evaluate against the 14 plain language principles.
    - Provide scores and qualitative feedback for each section.
3.  **Output Schema**: The AI's output is constrained by the `PlainLanguageAnalysisOutputSchema`, a comprehensive Zod schema that ensures the data is returned in a predictable, structured JSON format. This structured data directly maps to the components displayed in the UI.

A secondary flow, `score-calculator.ts`, is responsible for taking the AI's qualitative feedback on Text, Structural, and Visual clarity and converting it into numerical scores, including the final weighted `overallScore`.

This structured and detailed approach ensures that the AI's powerful analytical capabilities are translated into a user-friendly, insightful, and actionable report.
