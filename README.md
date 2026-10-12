# MindPredict 

**An ML-powered web application for predicting student mental health scores using lifestyle, academic, and social media usage patterns.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-10B981?style=for-the-badge)](https://mindpredict-1-cmta.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

## 🌐 Live Demo

**Try MindPredict:** https://mindpredict-1-cmta.onrender.com/

The application allows users to enter lifestyle and academic information and receive a machine-learning-generated mental health score estimate.

## 📌 Overview

MindPredict is a machine learning project that explores the relationship between students' lifestyle habits, academic routines, social media usage, and mental health scores.

The application combines a trained machine learning model with a FastAPI backend and a web-based frontend. Users can submit their information through an interactive form and receive a predicted score from the deployed model.

## ✨ Features

- **Mental Health Score Prediction:** Generates a score estimate using a trained ML model.
- **Lifestyle Analysis Inputs:** Considers sleep, physical activity, study hours, stress level, and social media habits.
- **Social Media Usage:** Includes daily usage hours, device unlock frequency, and preferred platform.
- **Input Validation:** Validates user-provided data through Pydantic and FastAPI.
- **REST API:** Exposes a prediction endpoint for frontend integration.
- **Web Interface:** Provides a browser-based interface for submitting inputs and viewing results.
- **Cloud Deployment:** Frontend and backend are deployed using Render.

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Programming Language | Python |
| Machine Learning | scikit-learn |
| Data Processing | Pandas |
| Model Serialization | Joblib |
| Backend | FastAPI, Uvicorn |
| Data Validation | Pydantic |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Render |

## ⚙️ How It Works

1. The user enters information about their age, academic level, lifestyle, stress, and social media usage.
2. The frontend sends the submitted information to the FastAPI backend.
3. The backend validates the input and prepares the features required by the trained model.
4. The saved machine learning model generates a prediction.
5. The API returns the predicted mental health score, which the frontend displays to the user.

## 📊 Input Features

The prediction API accepts the following information:

| Feature | Description |
|---|---|
| Age | User's age |
| Gender | Gender category |
| Country | Country of residence |
| Academic Level | Undergraduate, graduate, or high school |
| Most Used Platform | Preferred social media platform |
| Purpose of Use | Primary reason for social media usage |
| Average Daily Usage Hours | Daily social media usage |
| Daily Unlocks | Number of device unlocks per day |
| Study Hours | Daily study duration |
| Physical Activity Hours | Daily physical activity duration |
| Sleep Hours Per Night | Average nightly sleep |
| Stress Level | Self-reported stress category |

## 🔌 API Documentation

**Backend URL:** https://mindpredict-ctzu.onrender.com

**Interactive API documentation:** https://mindpredict-ctzu.onrender.com/docs

### `GET /`

Returns a basic backend response to confirm that the API is accessible.

### `POST /predict`

Accepts student lifestyle and usage information and returns the predicted mental health score.

Example request:

```json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 60,
  "study_hours": 5,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

Example response:

```json
{
  "predicted_mental_health_score": 6.25
}
```

*The response value above is illustrative; actual predictions depend on the trained model and the submitted inputs.*

## 🚀 Run Locally

### Prerequisites

- Python 3.12
- Git
- pip

### 1. Clone the repository

```bash
git clone https://github.com/satyam-1605/MindPredict.git
cd MindPredict
```

### 2. Create and activate a Conda environment

```bash
conda create -n mindpredict python=3.12
conda activate mindpredict
```

Alternatively, create a virtual environment using Python's `venv`.

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the backend

Ensure `main.py`, `requirements.txt`, and `mental_health_model.pkl` are in the expected backend directory.

Run:

```bash
uvicorn main:app --reload
```

The API will be available at:

http://127.0.0.1:8000

Open the interactive API documentation at:

http://127.0.0.1:8000/docs

### 5. Configure the frontend

The frontend must use the appropriate backend URL.

For local development, configure the API base URL in `app.js` to point to:

```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

Use the same variable name and request pattern as your existing frontend code.

Open `index.html` in your browser or use the VS Code Live Server extension. Keep the backend running while testing predictions.

For the deployed website, the API base URL should point to:

```text
https://mindpredict-ctzu.onrender.com
```

## ☁️ Deployment

MindPredict is deployed on Render using separate frontend and backend services.

### Backend

- **Framework:** FastAPI
- **Build command:** `pip install -r requirements.txt`
- **Start command:**

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend

- **Technologies:** HTML, CSS, JavaScript
- **Hosting:** Render Static Site
- **API connection:** Deployed FastAPI backend

**Note:** Render's free services may spin down after inactivity, so the first request after a period of inactivity can take longer.

## ⚠️ Disclaimer

MindPredict is an educational machine learning project. Its output is a model-generated estimate based on the information provided and patterns learned from its training data.

It is **not a clinical assessment, medical diagnosis, or substitute for professional mental health advice**. Predictions may be inaccurate and should not be used to make medical decisions.

## 🔮 Future Improvements

- Add visual analytics for lifestyle and usage patterns.
- Improve model evaluation and document performance metrics.
- Add automated tests for the API and prediction workflow.
- Improve input validation and user-facing error messages.
- Enhance accessibility and responsive design.
- Explore explainability techniques to better understand model predictions.

## 👨‍💻 Author

**Satyam Chaturvedi**

B.Tech — Computer Science and Engineering (AI & ML)

- **GitHub:** [@satyam-1605](https://github.com/satyam-1605)
- **Project Repository:** [MindPredict](https://github.com/satyam-1605/MindPredict)
- **Live Application:** [MindPredict Demo](https://mindpredict-1-cmta.onrender.com/)

---

⭐ If you find this project interesting, consider starring the repository.
