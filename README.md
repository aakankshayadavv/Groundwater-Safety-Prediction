# Groundwater Potability Classification System (BIS Standards)

An end-to-end Machine Learning diagnostic pipeline designed to assess and classify groundwater safety across Indian districts based on **Bureau of Indian Standards (BIS)** chemical thresholds.

The system leverages automated tabular feature engineering, robust outlier handling, SMOTE class balancing, and a soft-voting ensemble model optimized for high-risk recall and drinking-water safety.

---

## Project Overview
Groundwater contamination poses significant public health challenges, often governed by non-linear chemical interactions (such as pH, Fluoride, Nitrates, and Heavy Metals).

This project structures and parses raw water quality reports into an operational machine learning pipeline that flags non-potable and contaminated water sources. The pipeline ensures extreme chemical contamination events are correctly labeled prior to statistical cleaning, preventing false negative misclassifications in safety-critical environments.

---

## Machine Learning Workflow

* **1. Data Ingestion & Parsing:** PDF data extraction using PyPDF and regular expressions mapped across Indian states and districts.
* **2. Physical Preprocessing:** Correction of physically impossible readings (e.g., negative Magnesium, pH values outside the 0 to 14 range).
* **3. Domain Target Engineering:** Binary contamination labels generated using 8 core BIS rules prior to outlier trimming.
* **4. Outlier Handling:** Statistical IQR filtering applied to feature distributions post-labeling.
* **5. Stratified Split:** 80/20 train-test partitioning with training-only median imputation to avoid data leakage.
* **6. Resampling & Scaling:** Adaptive SMOTE balancing on minority classes paired with StandardScaler for linear models.
* **7. Hyperparameter Optimization:** 5-fold cross-validated GridSearchCV for Logistic Regression and Decision Tree models.
* **8. Soft-Voting Ensemble:** Model probability blending paired with decision threshold optimization (sweeping 0.20 to 0.50) to maximize recall on contaminated samples.
* **9. Diagnostic Auditing:** Feature importance interpretation, logistic coefficients, and false negative analysis.

---

## Key Engineering & Modeling Highlights
* **Leak-Free Target Generation:** BIS contamination thresholds (such as Calcium >= 75 mg/L, Nitrate >= 45 mg/L, Fluoride >= 1.5 mg/L) are assigned before outlier removal, ensuring true contamination signals are preserved for model learning.
* **Leak-Safe Imputation & Balancing:** Median imputation, scaling, and SMOTE are fitted strictly on training folds to prevent evaluation leakage into test splits.
* **Soft-Voting Ensemble:** Combines probability predictions from tuned Logistic Regression and Decision Tree models to generate balanced decision boundaries.
* **Threshold Tuning:** Dynamically shifts classification cutoffs to minimize false negatives where contaminated water is mistakenly flagged as safe.
* **Model Explainability:** Feature importances and regression weights align with key chemical metrics such as Electrical Conductivity, Total Hardness, Chlorides, and Fluoride.

---

## Tech Stack
* **Language & Core:** Python, Pandas, NumPy
* **Data Extraction & Database:** PyPDF, SQLAlchemy, MySQL
* **Machine Learning:** Scikit-Learn (LogisticRegression, DecisionTreeClassifier, VotingClassifier, GridSearchCV)
* **Class Imbalance:** Imbalanced-Learn (SMOTE)
* **Visualization:** Matplotlib, Seaborn
* **Model Persistence:** Joblib (Imputer, Scaler, Models, Threshold parameters)

---

## BIS Parameters Audited
The pipeline evaluates groundwater samples across major parameters:
* **Physicochemical:** pH, Electrical Conductivity (EC), Total Hardness
* **Major Ions & Nutrients:** Carbonate (CO3), Bicarbonate (HCO3), Chloride (Cl), Sulphate (SO4), Nitrate (NO3), Phosphate (PO4)
* **Cations & Metals:** Calcium (Ca), Magnesium (Mg), Sodium (Na), Potassium (K), Iron (Fe)
* **Heavy Trace Elements:** Arsenic (As in ppb), Uranium (U in ppb)
