
  # ISDATA ETL Production Dashboard App



  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Linux/Mac:
    source venv/bin/activate
    # On Windows:
    venv\Scripts\activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Install new dependencies for Google Sheets integration:**
    ```bash
    pip install google-auth google-api-python-client
    ```

5.  **Create `.env` file:**
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your actual database credentials and other configurations.

6.  **Set up Google Service Account for Google Sheets:**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new service account.
    *   Download the JSON key file.
    *   Save this file as `service-account.json` in the project root directory.
    *   Share your Google Sheets with the email address of the newly created service account.
    *   Update your `.env` file with the path to the service account file:
        ```
        GOOGLE_SERVICE_ACCOUNT_FILE=service-account.json
        ```

7.  **Run database and configuration migrations:**
    ```bash
    python manage.py makemigrations
    python manage.py makemigrations etl # For ETL app specific migrations
    python manage.py migrate
    python manage.py makemigrations
    python manage.py makemigrations configuration # For configuration app specific migrations
    python manage.py migrate
    ```

8.  **Create a superuser (for admin access):**
    
    ```bash
    python manage.py createsuperuser
    ```

9.  **Start Redis (for Celery):**
    ```bash
    docker run -d -p 6379:6379 redis:alpine
    ```
    Alternatively, if you have `docker-compose` set up:
    ```bash
    docker-compose up redis
    ```

10. **Start Celery worker:** 
    ```bash
    celery -A your_project_name worker -l info
    ```