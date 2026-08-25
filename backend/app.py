
import os
import joblib
import numpy as np

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sqlalchemy import create_engine, text


# =========================================================
# 1. DATABASE CONNECTION
# =========================================================

username = "root"
password = "14826571N"
host = "localhost"
database = "groundwater_db"

engine = create_engine(
    f"mysql+mysqlconnector://{username}:{password}@{host}/{database}"
)

print("Database connection successful...")


# =========================================================
# 2. LOAD ML MODELS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Logistic Regression model
model_lr = joblib.load(
    os.path.join(
        BASE_DIR,
        "logistic_regression_model.pkl"
    )
)


# Decision Tree model
model_dt = joblib.load(
    os.path.join(
        BASE_DIR,
        "decision_tree_model.pkl"
    )
)


# Final classification threshold
FINAL_THRESHOLD = joblib.load(
    os.path.join(
        BASE_DIR,
        "prediction_threshold.pkl"
    )
)


# Feature order used during training
features = joblib.load(
    os.path.join(
        BASE_DIR,
        "feature_order.pkl"
    )
)


# =========================================================
# 3. LOAD PREPROCESSING OBJECTS
# =========================================================

# Imputer used during model training
imputer = joblib.load(
    os.path.join(
        BASE_DIR,
        "imputer.pkl"
    )
)


# StandardScaler used during Logistic Regression training
scaler = joblib.load(
    os.path.join(
        BASE_DIR,
        "scaler.pkl"
    )
)


print("ML models and preprocessing objects loaded successfully...")


# =========================================================
# 4. FASTAPI
# =========================================================

app = FastAPI(
    title="Groundwater Quality Prediction API",
    version="1.0"
)


# =========================================================
# 5. CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# 6. INPUT DATA MODEL
# =========================================================

class WaterSample(BaseModel):

    ph: float
    ec: float
    co3: float
    hco3: float
    cl: float
    f: float
    so4: float
    no3: float
    total_hardness: float
    ca: float
    mg: float
    na: float
    k: float


# =========================================================
# 7. DATABASE INSERT
# =========================================================

def save_prediction(sample, prediction, probability):

    query = text("""
        INSERT INTO prediction_history (
            ph,
            ec,
            co3,
            hco3,
            cl,
            f,
            so4,
            no3,
            total_hardness,
            ca,
            mg,
            na,
            k,
            prediction,
            probability,
            threshold
        )

        VALUES (
            :ph,
            :ec,
            :co3,
            :hco3,
            :cl,
            :f,
            :so4,
            :no3,
            :total_hardness,
            :ca,
            :mg,
            :na,
            :k,
            :prediction,
            :probability,
            :threshold
        )
    """)

    values = {
        "ph": sample.ph,
        "ec": sample.ec,
        "co3": sample.co3,
        "hco3": sample.hco3,
        "cl": sample.cl,
        "f": sample.f,
        "so4": sample.so4,
        "no3": sample.no3,
        "total_hardness": sample.total_hardness,
        "ca": sample.ca,
        "mg": sample.mg,
        "na": sample.na,
        "k": sample.k,

        "prediction": prediction,
        "probability": probability,
        "threshold": FINAL_THRESHOLD
    }

    with engine.begin() as connection:

        result = connection.execute(
            query,
            values
        )

        return result.lastrowid


# =========================================================
# 8. ROOT / HEALTH CHECK
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Groundwater Quality Prediction API is running"
    }


@app.get("/health")
def health():

    try:

        with engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )

        return {
            "status": "healthy",
            "database": "connected",
            "models": "loaded"
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )


# =========================================================
# 9. PREDICTION ENDPOINT
# =========================================================

@app.post("/predict")
def predict(sample: WaterSample):

    try:

        # -------------------------------------------------
        # STEP 1
        # Create raw feature array in EXACT model order
        # -------------------------------------------------

        X_raw = np.array([
            [
                getattr(sample, feature)
                for feature in features
            ]
        ], dtype=float)


        # -------------------------------------------------
        # STEP 2
        # Apply the SAME imputer used during training
        # -------------------------------------------------

        X_imputed = imputer.transform(
            X_raw
        )


        # -------------------------------------------------
        # STEP 3
        # Apply the SAME scaler used during training
        # -------------------------------------------------

        X_scaled = scaler.transform(
            X_imputed
        )


        # -------------------------------------------------
        # STEP 4
        # Logistic Regression probability
        #
        # Logistic Regression was trained using
        # X_train_scaled, therefore it MUST receive
        # X_scaled during prediction.
        # -------------------------------------------------

        lr_probability = model_lr.predict_proba(
            X_scaled
        )[0][1]


        # -------------------------------------------------
        # STEP 5
        # Decision Tree probability
        #
        # Decision Trees do not require scaling.
        # The input is therefore imputed but not scaled.
        # -------------------------------------------------

        dt_probability = model_dt.predict_proba(
            X_imputed
        )[0][1]


        # -------------------------------------------------
        # STEP 6
        # Ensemble probability
        #
        # Equal-weight average of the two models.
        # -------------------------------------------------

        ensemble_probability = (
            lr_probability + dt_probability
        ) / 2


        # -------------------------------------------------
        # STEP 7
        # Apply final classification threshold
        # -------------------------------------------------

        if ensemble_probability >= FINAL_THRESHOLD:

            prediction = "Potentially Contaminated"
            contaminated = 1

        else:

            prediction = "Potentially Safe"
            contaminated = 0


        # -------------------------------------------------
        # STEP 8
        # Save result to MySQL
        # -------------------------------------------------

        prediction_id = save_prediction(
            sample,
            prediction,
            float(ensemble_probability)
        )


        # -------------------------------------------------
        # STEP 9
        # Return result to React
        # -------------------------------------------------

        return {

            "prediction_id": prediction_id,

            "prediction": prediction,

            "contaminated": contaminated,

            "probability": float(
                ensemble_probability
            ),

            "threshold": float(
                FINAL_THRESHOLD
            ),

            "logistic_probability": float(
                lr_probability
            ),

            "decision_tree_probability": float(
                dt_probability
            )
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# 10. PREDICTION HISTORY
# =========================================================

@app.get("/history")
def history(
    limit: int = Query(
        20,
        ge=1,
        le=100
    )
):

    try:

        query = text("""
            SELECT
                prediction_id,
                prediction_time,
                prediction,
                probability,
                threshold
            FROM prediction_history
            ORDER BY prediction_id DESC
            LIMIT :limit
        """)

        with engine.connect() as connection:

            result = connection.execute(
                query,
                {"limit": limit}
            )

            rows = result.mappings().all()


        return [
            dict(row)
            for row in rows
        ]


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

