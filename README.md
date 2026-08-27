# NFHS-5: Child Stunting & Public Health Diagnostic

An end-to-end data analytics diagnostic analyzing child stunting, maternal health indicators, paternal habits, and public infrastructure across India using SQL and Power BI.

---

## Project Overview
A comprehensive public health diagnostic project examining district-level health disparities across India using data from the **National Family Health Survey (NFHS-5)**. Rather than relying on broad state averages, this project investigates root causes behind child undernutrition—evaluating the disconnect between high physical sanitation access and persistent child stunting, alongside maternal and lifestyle risk factors.

---

## Key Highlights & Findings
* **The "Mystery District" Disconnect:** Pinpoints high-sanitation districts (>80%) that continue to suffer from high stunting rates (>35%), demonstrating that physical infrastructure alone is insufficient without targeted family-level interventions.
* **Maternal & Lifestyle Impact:** Correlates maternal literacy and anemia rates with child stunting, while evaluating how high paternal alcohol and tobacco consumption impacts household health resilience.
* **Risk Categorization:** Classifies 707 districts into actionable risk tiers (Red Zone: >40% stunting, Yellow Zone: 25–40%, Green Zone: <25%) to prioritize public health resource distribution.
* **System Efficiency:** Ranks states and districts based on full vaccination coverage and health insurance penetration to identify high-performing systems and critical intervention points.

---

## Tech Stack & Architecture
* **Database & Querying:** SQL (PostgreSQL / MySQL) for schema design, CTE-based performance ranking, multi-variable filtering, and custom risk-tier aggregations.
* **Visualization & BI:** Power BI for interactive dashboards, scatter correlations (Sanitation vs. Stunting, Maternal Anemia vs. Stunting), and choropleth state vaccination maps.
* **Data Source:** [NFHS-5 District-Level Health Dataset (NITI Aayog NDAP)](https://ndap.niti.gov.in/dataset/6822) covering 28 States and 8 Union Territories.

---

## Core SQL Audits Included
* `Mystery District Audit`: Identifies areas with high sanitation (>80%) but severe stunting (>35%).
* `Lifestyle & Gender Audit`: Correlates stunting against maternal literacy (<50%) and paternal alcohol intake (>40%).
* `State Performance Ranking`: Evaluates states by average full vaccination and insurance rates.
* `Household Risk Audit`: Flags compound-risk households lacking clean fuel, insurance, and experiencing high tobacco use.

---

## Actionable Recommendations
* **Community-Led Health Literacy:** Deploy visual, non-text nutrition modules in districts where maternal literacy is below 50%.
* **Behavioral Programs:** Pair child wellness checkups with paternal de-addiction and financial literacy workshops.
* **Targeted Clinical Care:** Scale prenatal iron-folic acid supplementation to break intergenerational malnutrition cycles.
* **Water Quality Audits:** Transition infrastructure focus from purely toilet construction to rigorous drinking water testing.
