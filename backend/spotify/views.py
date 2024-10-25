from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .utils import *
from room_api.models import Room
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import logging
from dotenv import load_dotenv
import urllib.parse

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

logger = logging.getLogger(__name__)

class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing'

        state = urllib.parse.quote(str(request.user.id))

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'state': state
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")
    state = request.GET.get("state")

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")
    if error:
        return redirect("https://spotify-house-party.vercel.app/error")
    if state:
        User = get_user_model()
        try:
            user = User.objects.get(id=int(state))
        except (User.DoesNotExist, ValueError):
            user = request.user
    else:
        user = request.user
    update_or_create_user_tokens(
        user, access_token, token_type, expires_in, refresh_token
    )
    return redirect("https://spotify-house-party.vercel.app/")

class GetSpotifyAccessToken(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        access_token = get_user_tokens(request.user).access_token
        return Response({"access_token": access_token}, status=status.HTTP_200_OK)

class IsSpotifyAuthenticated(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(request.user)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)
    
class SpotifyUserProfile(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        return Response(execute_spotify_user_profile(request.user), status=status.HTTP_200_OK)
    
class CheckSpotifyPremium(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_profile = execute_spotify_user_profile(request.user)
        is_premium = user_profile.get('product') == 'premium'
        return Response({"isPremium": is_premium}, status=status.HTTP_200_OK)
    
class SpotifyLogout(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, format=None):
        spotify_logout(request.user)
        return Response({"message": "Spotify account disconnected successfully"}, status=status.HTTP_200_OK)

class CurrentSong(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        host_room = Room.objects.filter(host=user).first()
        user_room = Room.objects.filter(users=user).first()
        if not user_room and not host_room:
            return Response({"error": "You are not in any room."}, status=status.HTTP_404_NOT_FOUND)
        # Determine the host of the room based on the user's role
        if host_room:
            host = host_room.host
        else:
            host = user_room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")
        artist_string = ", ".join([artist.get("name") for artist in item.get("artists")])

        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "image_url": album_cover,
            "is_playing": is_playing,
            "votes": 0,
            "id": song_id,
        }

        return Response(song, status=status.HTTP_200_OK)

class PauseSong(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        user = request.user
        room = Room.objects.filter(host=user).first()
        
        if not room:
            # If user is not a host, check if they're in a room as a guest
            room = Room.objects.filter(users=user).first()
            if not room:
                return Response({"error": "You are not in any room."}, status=status.HTTP_404_NOT_FOUND)

        if room.host == user or (room.guest_can_pause and user in room.users.all()):
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({"error": "You don't have permission to pause."}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        user = request.user
        room = Room.objects.filter(host=user).first()
        
        if not room:
            # If user is not a host, check if they're in a room as a guest
            room = Room.objects.filter(users=user).first()
            if not room:
                return Response({"error": "You are not in any room."}, status=status.HTTP_404_NOT_FOUND)

        if room.host == user or (room.guest_can_pause and user in room.users.all()):
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({"error": "You don't have permission to play."}, status=status.HTTP_403_FORBIDDEN)

class PlaySongAlong(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        uri = request.data.get("uri")
        position_ms = request.data.get("position_ms")

        # If the URI is actually just a track ID, convert it to a proper Spotify URI
        if not uri.startswith("spotify:"):
            uri = f"spotify:track:{uri}"

        endpoint = "player/play"
        data = {
            "uris": [uri],
            "position_ms": position_ms
        }
        response = execute_spotify_api_request(request.user, endpoint, put_=True, data_=data)
        return Response(response, status=status.HTTP_204_NO_CONTENT)

class PauseSongAlong(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        endpoint = "player/pause"
        response = execute_spotify_api_request(request.user, endpoint, put_=True)
        
        if 'Error' in response:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        return Response(response, status=status.HTTP_204_NO_CONTENT)
