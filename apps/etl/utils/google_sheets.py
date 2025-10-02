# ================================
# apps/etl/utils/google_sheets.py
# ================================

from google.oauth2 import service_account
from googleapiclient.discovery import build
import logging
import httplib2
from google_auth_httplib2 import AuthorizedHttp

logger = logging.getLogger(__name__)

class GoogleSheetsExtractor:
    """Extract data from Google Sheets"""
    
    def __init__(self, service_account_file):
        self.service_account_file = service_account_file
        self.service = None
    
    def connect(self):
        """Connect to Google Sheets API"""
        try:
            scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
            
            if isinstance(self.service_account_file, dict):
                credentials = service_account.Credentials.from_service_account_info(
                    self.service_account_file,
                    scopes=scopes
                )
            else:
                credentials = service_account.Credentials.from_service_account_file(
                    self.service_account_file,
                    scopes=scopes
                )
            
            http = httplib2.Http(timeout=60)
            authed_http = AuthorizedHttp(credentials, http=http)
            self.service = build('sheets', 'v4', http=authed_http)
            logger.info("✓ Google Sheets API connected")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to connect to Google Sheets: {e}")
            return False
    
    def extract_sheet_data(self, spreadsheet_id, range_name):
        """Extract data from a specific sheet range"""
        try:
            sheet = self.service.spreadsheets()
            result = sheet.values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute(num_retries=3)
            
            values = result.get('values', [])
            logger.info(f"✓ Extracted {len(values)} rows from {range_name}")
            return values
        except Exception as e:
            logger.error(f"✗ Failed to extract data from {range_name}: {e}")
            return []
    
    def get_all_sheets(self, spreadsheet_id):
        """Get list of all sheets in spreadsheet"""
        try:
            sheet_metadata = self.service.spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute(num_retries=3)
            
            sheets = sheet_metadata.get('sheets', [])
            sheet_names = [sheet['properties']['title'] for sheet in sheets]
            return sheet_names
        except Exception as e:
            logger.error(f"✗ Failed to get sheets list: {e}")
            return []
