import { useEffect, useState } from "react";
import "./styles.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("home");

  const [formData, setFormData] = useState({
    ph: "",
    ec: "",
    co3: "",
    hco3: "",
    cl: "",
    f: "",
    so4: "",
    no3: "",
    total_hardness: "",
    ca: "",
    mg: "",
    na: "",
    k: "",
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPage = window.location.hash.replace("#", "");
    if (["home", "analyze", "performance", "history", "about"].includes(savedPage)) {
      setPage(savedPage);
    }
  }, []);

  // Fetch persistent history directly from backend database
  useEffect(() => {
    if (page === "history") {
      fetch(`${API_URL}/history`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch history");
          return res.json();
        })
        .then((data) => setHistory(data))
        .catch((err) => console.error("History fetch error:", err));
    }
  }, [page]);

  const navigate = (newPage) => {
    setPage(newPage);
    window.location.hash = newPage;
    window.scrollTo(0, 0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const analyzeWater = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {};
      Object.keys(formData).forEach((key) => {
        payload[key] = Number(formData[key]);
      });

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Prediction failed");

      const data = await response.json();
      setResult(data);
      setHistory((previous) => [data, ...previous]);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the prediction server. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ph: "", ec: "", co3: "", hco3: "", cl: "", f: "", so4: "", no3: "", total_hardness: "", ca: "", mg: "", na: "", k: "" });
    setResult(null);
    setError("");
  };

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="brand" onClick={() => navigate("home")}>
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">AquaGuard</div>
            <div className="brand-subtitle">Groundwater Intelligence</div>
          </div>
        </div>

        <nav>
          {["home", "analyze", "performance", "history", "about"].map((p) => (
            <button key={p} className={page === p ? "active" : ""} onClick={() => navigate(p)}>
              {p === "performance" ? "Model Performance" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>

        <button className="nav-cta" onClick={() => navigate("analyze")}>Run Analysis</button>
      </header>


      {/* ================= HOME ================= */}
      {page === "home" && (
        <main>
          <section className="hero">
            <div className="hero-left">
              <div className="eyebrow">MACHINE LEARNING × WATER QUALITY</div>

              <h1>Intelligence for<span> Groundwater.</span></h1>

              <p>
                AquaGuard analyzes groundwater chemistry using a tuned
                soft-voting ensemble of Logistic Regression and Decision Tree
                models — balanced with SMOTE and optimized with GridSearchCV —
                to identify potentially contaminated samples against BIS IS 10500 standards.
              </p>

              <div className="hero-buttons">
                <button className="primary-button" onClick={() => navigate("analyze")}>
                  Analyze a Sample →
                </button>
                <button className="secondary-button" onClick={() => navigate("performance")}>
                  View Model Performance
                </button>
              </div>

              {/* CORRECTED: threshold is 0.50 (auto-selected by F1 sweep), not 0.45 */}
              <div className="hero-note">
                ✓ Decision threshold: 0.50 (F1-optimized)
                <span>•</span>
                ✓ 5-fold cross-validation
                <span>•</span>
                ✓ SMOTE balanced
                <span>•</span>
                ✓ GridSearchCV tuned
              </div>
            </div>

            <div className="hero-right">
              <div className="orb">
                <div className="orb-inner">💧</div>
              </div>

              {/* CORRECTED: real CV recall (most important metric for safety) and ROC-AUC */}
              <div className="floating-stat stat-top">
                <small>CV Recall</small>
                <strong>99.76%</strong>
              </div>

              <div className="floating-stat stat-bottom">
                <small>ROC-AUC</small>
                <strong>99.71%</strong>
              </div>
            </div>
          </section>


          {/* METRICS — all corrected from real executed notebook */}
          <section className="metrics-section">
            <div className="section-label">MODEL AT A GLANCE</div>
            <h2>Validated performance</h2>

            <div className="metric-grid">
              {/* CORRECTED: real CV numbers from 5-fold cross-validation */}
              <Metric value="96.88%" label="CV Accuracy" />
              <Metric value="77.59%" label="CV Precision" />
              <Metric value="99.76%" label="CV Recall" />
              <Metric value="87.26%" label="CV F1 Score" />
              <Metric value="99.71%" label="CV ROC-AUC" />
            </div>
          </section>


          {/* HOW IT WORKS */}
          <section className="how-section">
            <div className="section-label">HOW IT WORKS</div>
            <h2>From chemistry to intelligence</h2>

            <div className="steps">
              <Step
                number="01"
                title="Clean & Impute"
                text="Outliers removed using IQR method. Remaining missing values filled with median imputation on training data only."
              />
              <Step
                number="02"
                title="SMOTE & Scale"
                text="SMOTE generates synthetic Contaminated samples on the training set only, balancing the 89%/11% class split. StandardScaler normalizes features for Logistic Regression."
              />
              <Step
                number="03"
                title="GridSearchCV Tuning"
                text="GridSearchCV finds optimal hyperparameters: C=100 for Logistic Regression, max_depth=8 for the Decision Tree — both scored by F1 across 5 folds."
              />
              <Step
                number="04"
                title="Soft Voting Ensemble"
                text="Probabilities from both tuned models are averaged (soft voting). The threshold 0.50 — selected automatically by the F1 sweep — turns the average into a Safe/Contaminated call."
              />
            </div>
          </section>
        </main>
      )}


      {/* ================= ANALYZE ================= */}
      {page === "analyze" && (
        <main className="page-container">
          <PageHeader
            eyebrow="WATER ANALYSIS"
            title="Analyze a Groundwater Sample"
            text="Enter the 13 measured chemical parameters. The soft-voting ensemble will calculate the contamination probability using both the tuned Logistic Regression and Decision Tree models."
          />

          <form className="analysis-form" onSubmit={analyzeWater}>
            <div className="form-grid">
              <Input label="pH" name="ph" value={formData.ph} onChange={handleChange} placeholder="7.8" />
              <Input label="Electrical Conductivity (EC)" name="ec" value={formData.ec} onChange={handleChange} placeholder="1200" />
              <Input label="Carbonate (CO₃)" name="co3" value={formData.co3} onChange={handleChange} placeholder="0" />
              <Input label="Bicarbonate (HCO₃)" name="hco3" value={formData.hco3} onChange={handleChange} placeholder="300" />
              <Input label="Chloride (Cl)" name="cl" value={formData.cl} onChange={handleChange} placeholder="100" />
              <Input label="Fluoride (F)" name="f" value={formData.f} onChange={handleChange} placeholder="0.5" />
              <Input label="Sulphate (SO₄)" name="so4" value={formData.so4} onChange={handleChange} placeholder="50" />
              <Input label="Nitrate (NO₃)" name="no3" value={formData.no3} onChange={handleChange} placeholder="20" />
              <Input label="Total Hardness" name="total_hardness" value={formData.total_hardness} onChange={handleChange} placeholder="250" />
              <Input label="Calcium (Ca)" name="ca" value={formData.ca} onChange={handleChange} placeholder="50" />
              <Input label="Magnesium (Mg)" name="mg" value={formData.mg} onChange={handleChange} placeholder="30" />
              <Input label="Sodium (Na)" name="na" value={formData.na} onChange={handleChange} placeholder="60" />
              <Input label="Potassium (K)" name="k" value={formData.k} onChange={handleChange} placeholder="5" />
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Analyzing..." : "Run ML Analysis →"}
              </button>
              <button className="secondary-button" type="button" onClick={resetForm}>
                Clear
              </button>
            </div>
          </form>

          {error && <div className="error-message">⚠ {error}</div>}

          {result && (
            <section className="result-area">
              <div className={result.contaminated === 1 ? "prediction contaminated" : "prediction safe"}>
                <div>
                  <div className="result-label">FINAL ASSESSMENT</div>
                  <h2>{result.prediction}</h2>
                  <p>Prediction ID: #{result.prediction_id}</p>
                </div>

                <div className="ensemble-score">
                  <small>ENSEMBLE PROBABILITY</small>
                  <strong>{formatPercent(result.probability)}</strong>
                </div>
              </div>

              <div className="model-card-grid">
                <ProbabilityCard title="Logistic Regression" probability={result.logistic_probability} />
                <ProbabilityCard title="Decision Tree" probability={result.decision_tree_probability} />
                <ProbabilityCard title="Soft-Voting Ensemble" probability={result.probability} highlight />
              </div>

              <div className="threshold-box">
                <div>
                  <small>DECISION THRESHOLD</small>
                  {/* Threshold comes from the pkl file — dynamically shown, not hardcoded */}
                  <strong>{Number(result.threshold).toFixed(2)}</strong>
                </div>

                <div className="threshold-text">
                  <p>Classification rule</p>
                  <span>
                    Ensemble probability{" "}
                    <b>{Number(result.probability).toFixed(4)}</b>
                    {" "}≥{" "}
                    threshold <b>{Number(result.threshold).toFixed(2)}</b>
                    {" → "}
                    <b>{result.contaminated === 1 ? "Contaminated" : "Safe"}</b>
                  </span>
                </div>
              </div>
            </section>
          )}
        </main>
      )}


      {/* ================= PERFORMANCE ================= */}
      {page === "performance" && (
        <main className="page-container">
          <PageHeader
            eyebrow="MODEL PERFORMANCE"
            title="How well does the model perform?"
            text="All numbers are from the actual notebook execution on your real dataset (11,459 rows after outlier removal). Test set = held-out 20%. Cross-validation = 5-fold stratified."
          />

          {/* INDIVIDUAL MODEL RESULTS */}
          <section className="performance-section">
            <div className="performance-heading">
              <div>
                <div className="section-label">INDIVIDUAL MODELS — TEST SET</div>
                <h2>Before Ensembling</h2>
              </div>
            </div>

            <div className="performance-grid">
              {/* CORRECTED: real test-set numbers per model */}
              <Performance value="92.7%" label="LR Accuracy" />
              <Performance value="60.2%" label="LR Precision" />
              <Performance value="92.7%" label="LR Recall" />
              <Performance value="73.0%" label="LR F1 Score" />
            </div>

            <div className="performance-grid" style={{ marginTop: "1rem" }}>
              <Performance value="97.6%" label="DT Accuracy" />
              <Performance value="82.3%" label="DT Precision" />
              <Performance value="98.8%" label="DT Recall" />
              <Performance value="89.8%" label="DT F1 Score" />
            </div>
          </section>

          <section className="performance-section">
            <div className="performance-heading">
              <div>
                <div className="section-label">FINAL TEST SET — SOFT VOTING ENSEMBLE</div>
                <h2>Ensemble Performance</h2>
              </div>
              {/* CORRECTED: threshold is 0.50, not 0.45 */}
              <div className="threshold-pill">Threshold: 0.50 (auto-selected by F1 sweep)</div>
            </div>

            <div className="performance-grid">
              {/* CORRECTED: real ensemble test-set numbers */}
              <Performance value="97.1%" label="Accuracy" />
              <Performance value="79.3%" label="Precision" />
              <Performance value="98.8%" label="Recall" />
              <Performance value="88.0%" label="F1 Score" />
            </div>

            {/* CORRECTED: real confusion matrix from test set */}
            <div className="confusion-section">
              <h3>Confusion Matrix — Test Set (2,292 samples)</h3>
              <div className="confusion-grid">
                <div className="cm-box tn">
                  <span>True Negative</span>
                  <strong>1,984</strong>
                  <small>Safe → correctly called Safe</small>
                </div>
                <div className="cm-box fp">
                  <span>False Positive</span>
                  <strong>63</strong>
                  <small>Safe → wrongly called Contaminated</small>
                </div>
                <div className="cm-box fn">
                  <span>False Negative</span>
                  <strong>3</strong>
                  <small>Contaminated → missed as Safe</small>
                </div>
                <div className="cm-box tp">
                  <span>True Positive</span>
                  <strong>242</strong>
                  <small>Contaminated → correctly caught</small>
                </div>
              </div>
            </div>


            {/* CROSS VALIDATION */}
            <div className="cv-section">
              <div className="section-label">5-FOLD CROSS-VALIDATION</div>
              <h2>Validation Stability</h2>
              <p>
                The full pipeline (outlier removal → SMOTE → GridSearchCV tuning → soft-voting ensemble)
                was run 5 times on different data splits to confirm results are stable, not a fluke.
              </p>

              <div className="cv-table">
                <div className="table-row table-header">
                  <span>Metric</span>
                  <span>Mean</span>
                  <span>Std. Dev.</span>
                </div>
                {/* CORRECTED: all real CV numbers from the executed notebook */}
                <CVRow name="Accuracy"  mean="96.88%" std="0.53%" />
                <CVRow name="Precision" mean="77.59%" std="3.15%" />
                <CVRow name="Recall"    mean="99.76%" std="0.22%" />
                <CVRow name="F1 Score"  mean="87.26%" std="1.95%" />
                <CVRow name="ROC-AUC"   mean="99.71%" std="0.10%" />
              </div>

              <div className="cv-note">
                <strong>Key takeaway:</strong> Recall is the most important metric here —
                a missed contaminated sample is the most dangerous error. At 99.76% (±0.22%)
                across all 5 folds, the model consistently catches nearly every truly
                contaminated sample, with very low variance.
              </div>
            </div>
          </section>
        </main>
      )}


      {/* ================= HISTORY ================= */}
      {page === "history" && (
        <main className="page-container">
          <PageHeader
            eyebrow="PREDICTION HISTORY"
            title="Previous Analyses"
            text="Prediction records stored persistently in the database."
          />

          {history.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">◌</div>
              <h3>No predictions yet</h3>
              <p>Run a groundwater analysis and your result will appear here.</p>
              <button className="primary-button" onClick={() => navigate("analyze")}>
                Run First Analysis →
              </button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div className="history-item" key={index}>
                  <div>
                    <span className="history-id">Prediction #{item.prediction_id}</span>
                    <h3>{item.prediction}</h3>
                  </div>

                  <div className="history-probability">
                    <small>Ensemble Probability</small>
                    <strong>{formatPercent(item.probability)}</strong>
                  </div>

                  <div className="history-models">
                    <span>LR: {formatPercent(item.logistic_probability)}</span>
                    <span>DT: {formatPercent(item.decision_tree_probability)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}


      {/* ================= ABOUT ================= */}
      {page === "about" && (
        <main className="page-container">
          <PageHeader
            eyebrow="ABOUT THE PROJECT"
            title="Groundwater Quality Intelligence"
            text="A machine learning system that classifies groundwater samples as Safe or Contaminated using 13 chemical parameters measured against BIS IS 10500:2012 drinking-water standards."
          />

          <section className="about-grid">
            <div className="about-card large">
              <div className="section-label">PROJECT OBJECTIVE</div>
              <h2>Turning groundwater chemistry into actionable insight.</h2>
              <p>
                The system evaluates 13 chemical parameters — pH, electrical conductivity,
                carbonate, bicarbonate, chloride, fluoride, sulphate, nitrate, total hardness,
                calcium, magnesium, sodium, and potassium — to predict whether a sample
                meets BIS IS 10500:2012 safety standards.
              </p>
              <p>
                The pipeline combines IQR-based outlier removal, median imputation, SMOTE
                oversampling (training set only), StandardScaler normalization, and
                GridSearchCV hyperparameter tuning into a verified soft-voting ensemble
                of Logistic Regression and Decision Tree classifiers.
              </p>
            </div>

            {/* CORRECTED: pipeline steps and threshold */}
            <div className="about-card">
              <div className="section-label">MODEL ARCHITECTURE</div>
              <div className="architecture">
                <div>Raw Chemical Parameters (13 features)</div>
                <span>↓</span>
                <div>IQR Outlier Removal (31.2% of rows removed)</div>
                <span>↓</span>
                <div>BIS Threshold Label Creation</div>
                <span>↓</span>
                <div>80/20 Stratified Train-Test Split</div>
                <span>↓</span>
                <div>Median Imputation + SMOTE (training only)</div>
                <span>↓</span>
                <div>StandardScaler (for Logistic Regression)</div>
                <span>↓</span>
                <div>GridSearchCV Tuning — LR: C=100 | DT: max_depth=8</div>
                <span>↓</span>
                <div className="architecture-final">Soft-Voting Ensemble (average probabilities)</div>
                <span>↓</span>
                <div>Threshold = 0.50 (auto-selected by F1 sweep)</div>
              </div>
            </div>

            {/* CORRECTED: real feature importances from tuned DT (max_depth=8) */}
            <div className="about-card">
              <div className="section-label">TOP FEATURES</div>
              <div className="feature-list">
                <Feature name="NO₃ (Nitrate)"   value="70.03%" />
                <Feature name="F (Fluoride)"     value="24.94%" />
                <Feature name="Total Hardness"   value="3.54%"  />
                <Feature name="K (Potassium)"    value="0.50%"  />
              </div>
              <p className="feature-note">
                Feature importance from the tuned Decision Tree (max_depth=8, GridSearchCV).
                Nitrate alone accounts for 70% of the model's decisions — the primary
                contamination driver in this dataset.
              </p>
            </div>

            {/* CORRECTED: added imbalanced-learn, updated hyperparameter info */}
            <div className="about-card">
              <div className="section-label">TECHNOLOGY STACK</div>
              <div className="tech-list">
                <span>Python</span>
                <span>Scikit-learn</span>
                <span>Imbalanced-learn (SMOTE)</span>
                <span>FastAPI</span>
                <span>React.js</span>
                <span>MySQL</span>
                <span>SQLAlchemy</span>
                <span>Joblib</span>
                <span>Pandas</span>
                <span>pypdf</span>
              </div>

              <div className="section-label" style={{ marginTop: "1.2rem" }}>TUNED HYPERPARAMETERS</div>
              <div className="tech-list">
                <span>LR: C = 100</span>
                <span>DT: max_depth = 8</span>
                <span>DT: min_samples_split = 10</span>
                <span>DT: min_samples_leaf = 2</span>
                <span>DT: criterion = gini</span>
              </div>
            </div>
          </section>
        </main>
      )}


      {/* ================= FOOTER ================= */}
      <footer>
        <div className="footer-brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>AquaGuard</strong>
            <span>Groundwater Intelligence</span>
          </div>
        </div>
        <p>Machine Learning × Data Analytics × Water Quality</p>
      </footer>

    </div>
  );
}


/* =====================================================
   COMPONENTS
===================================================== */

function Metric({ value, label }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Input({ label, name, value, onChange, placeholder }) {
  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        type="number"
        step="any"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

function ProbabilityCard({ title, probability, highlight }) {
  const value = Number(probability || 0) * 100;
  return (
    <div className={highlight ? "probability-card highlight" : "probability-card"}>
      <div className="probability-header">
        <div>
          <small>MODEL</small>
          <h3>{title}</h3>
        </div>
        <strong>{value.toFixed(2)}%</strong>
      </div>
      <div className="probability-bar">
        <div style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span>Predicted contamination probability</span>
    </div>
  );
}

function PageHeader({ eyebrow, title, text }) {
  return (
    <div className="page-header">
      <div className="section-label">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function Performance({ value, label }) {
  return (
    <div className="performance-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

// Renamed from TableRow to CVRow to avoid collision with the TableRow import pattern
function CVRow({ name, mean, std }) {
  return (
    <div className="table-row">
      <span>{name}</span>
      <strong>{mean}</strong>
      <span>± {std}</span>
    </div>
  );
}

function Feature({ name, value }) {
  return (
    <div className="feature-row">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatPercent(value) {
  if (value === undefined || value === null) return "0.00%";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

export default App;
