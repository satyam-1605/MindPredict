# MindPredict

**Machine-learning-based mental health score estimation from lifestyle and digital behavior data.**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Input Features](#input-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Run the Backend](#run-the-backend)
- [Run the Frontend](#run-the-frontend)
- [Model and Prediction Workflow](#model-and-prediction-workflow)
- [Author and License](#author-and-license)
- [Screenshots](#screenshots)

## Overview

MindPredict is a web application that estimates a numerical mental health score from a person's lifestyle and digital behavior inputs. The browser sends the assessment fields as JSON to a FastAPI endpoint, which prepares a one-row pandas DataFrame and passes it to a saved scikit-learn model. The API returns the model's estimated score.

This is an educational machine learning project, not a clinical diagnostic tool. Its output is not a diagnosis or a substitute for professional care.

## Features

- Web-based assessment form with 12 required inputs.
- Lifestyle, academic, stress, and digital behavior inputs.
- Prediction using a saved machine learning model.
- FastAPI REST endpoint at `POST /predict`.
- Responsive HTML, CSS, and vanilla JavaScript frontend.
- Client-side checks and API-side Pydantic validation, including field constraints and enumerated choices.
- Frontend error handling for validation responses, network failures, timeouts, and unexpected response shapes.

## Input Features

The API accepts these JSON properties. Property names are case-sensitive. The frontend presents country as a dropdown; the backend accepts `country` as a string.

| Input | JSON property | Accepted values or constraint |
| --- | --- | --- |
| Age | `age` | Integer from 10 to 100 |
| Gender | `gender` | `Male` or `Female` |
| Country | `country` | String; the frontend offers India, USA, Canada, Australia, UK, Germany, Mexico, Turkey, France, or Other |
| Academic Level | `academic_level` | `Undergraduate`, `Graduate`, or `High School` |
| Most Used Platform | `most_used_platform` | `Facebook`, `LinkedIn`, `Instagram`, `Snapchat`, `Twitter`, `YouTube`, `TikTok`, `LINE`, `KakaoTalk`, `VKontakte`, `WhatsApp`, or `WeChat` |
| Purpose of Use | `purpose_of_use` | `Networking`, `Education`, `Entertainment`, or `News` |
| Average Daily Usage Hours | `avg_daily_usage_hours` | Number from 0 to 24 |
| Daily Unlocks | `daily_unlocks` | Integer of 0 or greater |
| Study Hours | `study_hours` | Number from 0 to 24 |
| Physical Activity Hours | `physical_activity_hours` | Number from 0 to 24 |
| Sleep Hours Per Night | `sleep_hours_per_night` | Number from 0 to 24 |
| Stress Level | `stress_level` | `Medium`, `Low`, `Very High`, or `High` |

All 12 fields are required by the request model.

## Technology Stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Python, FastAPI, Uvicorn, Pydantic
- **Machine learning and data processing:** scikit-learn, Joblib, pandas

## Project Structure

```text
.
├── .gitignore
├── app.js
├── index.html
├── main.py
├── mental_health_model.pkl
├── MLProject.ipynb
├── README.md
├── requirements.txt
├── style.css
├── Student Social Media And Mental Health Impact.csv
```

## Prerequisites

- Windows, with Conda (Miniconda or Anaconda) or another Python virtual environment.
- Python 3.12. The listed packages have Python 3.12-compatible releases, though `requirements.txt` does not pin package versions. Compatibility between the installed scikit-learn version and the serialized model has not been established here.
- Git, if cloning the repository.
- A browser. VS Code Live Server is optional for serving the frontend.

## Installation and Setup

The repository URL is not available in the current project files. Replace the placeholder URL with the published repository URL before cloning:

```powershell
$RepoUrl = "https://github.com/<USERNAME>/<REPOSITORY>.git"  # Replace with the actual URL
git clone $RepoUrl
Set-Location .\mindpredict
```

If the cloned folder has a different name, change the `Set-Location` path accordingly. From the directory containing `main.py`, create and activate the Conda environment:

```powershell
conda create --name mindpredict python=3.12 -y
conda activate mindpredict
python -m pip install -r requirements.txt
```

If an environment named `mindpredict` already exists, do not create it again; activate it and install the requirements:

```powershell
conda activate mindpredict
python -m pip install -r requirements.txt
```

## Run the Backend

In the activated environment, from the directory containing `main.py` and `mental_health_model.pkl`, start the API:

```powershell
uvicorn main:app --reload
```

- API base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Prediction endpoint: `POST http://127.0.0.1:8000/predict`

The model file is loaded when `main.py` is imported. Keep `mental_health_model.pkl` in the working directory when starting Uvicorn.

## Run the Frontend

Open the project root in VS Code and use Live Server on `index.html`, or serve the static files from the project root with Python:

```powershell
python -m http.server 5500
```

Then open `http://127.0.0.1:5500`. The HTML references the stylesheet at `./style.css` and the script at `./app.js`. In `app.js`, `API_BASE_URL` is set to `http://127.0.0.1:8000`; update it there if the API runs at a different address. The backend currently enables CORS for all origins.

## Model and Prediction Workflow

`main.py` loads `mental_health_model.pkl` with `joblib.load` when the module is imported. For each request, it creates a pandas DataFrame containing the 12 submitted values and an additional `Grouped_country` value. The country group is the submitted country when it is in the backend's fixed country list; otherwise it is `Other`. The original `Country` value is also passed through unchanged. The code calls `model.predict` on that one-row DataFrame, converts the first prediction to a float, rounds it to two decimal places, and returns it as `predicted_mental_health_score`.

## Author and License

- **Author:** [Satyam Chaturvedi] (replace with your preferred name or profile).
- **License:** No license file or license information was found in the project. Add a license only after choosing the terms, then update this section.

## Screenshots

No screenshots are currently included. Add actual project screenshots here when available.
