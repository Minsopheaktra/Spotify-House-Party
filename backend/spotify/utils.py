# Import necessary modules and models
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

logger = logging.getLogger(__name__)

# Base URL for Spotify API endpoints
BASE_URL = "https://api.spotify.com/v1/me/"

# Function to get the user tokens from the database
def get_user_tokens(user):
    user_tokens = SpotifyToken.objects.filter(user=user)
    if user_tokens.exists():
        return user_tokens[0]
    return None

# Function to update or create user tokens in the database
def update_or_create_user_tokens(user, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(user)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=["access_token", "refresh_token", "expires_in", "token_type"])
    else:
        tokens = SpotifyToken(
            user=user,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in,
        )
        tokens.save()
    

# Function to check if the user is authenticated with Spotify
def is_spotify_authenticated(user):
    tokens = get_user_tokens(user)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(user)
        return True
    return False

# Function to refresh the Spotify access token
def refresh_spotify_token(user):
    refresh_token = get_user_tokens(user).refresh_token

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")

    update_or_create_user_tokens(user, access_token, token_type, expires_in, refresh_token)

# Function to get the Spotify user profile
def execute_spotify_user_profile(user):
    tokens = get_user_tokens(user)
    headers = {
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + tokens.access_token,
    }
    response = get(BASE_URL , headers=headers)
    try:
        return response.json()
    except:
        return {"Error": "Issue requesting for user profile"}
    
def spotify_logout(user):
    tokens = get_user_tokens(user)
    if tokens:
        tokens.delete()
    else:
        logger.info(f"No Spotify tokens found for user {user}")

# Function to execute Spotify API requests
def execute_spotify_api_request(host, endpoint, post_=False, put_=False, data_=None):
    tokens = get_user_tokens(host)
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokens.access_token,
    }
    url = BASE_URL + endpoint
    try:
        if post_:
            response = post(url, headers=headers, json=data_)
        elif put_:
            response = put(url, headers=headers, json=data_)
        else:
            response = get(url, {}, headers=headers)
        
        response.raise_for_status()  # Raise an exception for non-2xx status codes
        
        if response.text:  # Check if there's content in the response
            return response.json()
        else:
            return {"message": "Success, no content"}
    except Exception as e:
        return {"Error": f"Issue with request: {str(e)}"}

# Function to play a song
def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)

# Function to pause a song
def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)
