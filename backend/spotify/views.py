from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .utils import *
from room_api.models import Room
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

import logging
from dotenv import load_dotenv

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

logger = logging.getLogger(__name__)

class AuthURL(APIView):
    def get(self, request, fornat=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")

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

    update_or_create_user_tokens(
        request.user, access_token, token_type, expires_in, refresh_token
    )
    return redirect("http://localhost:5173")

class IsAuthenticated(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user_id = request.user.id  # Retrieve user from JWT token
        is_authenticated = is_spotify_authenticated(user_id)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        room = Room.objects.filter(
            host=user
        ).first()
        room_code = room.code
        host = room.host

        if not room_code:
            return Response({"detail": "Room code not found."}, status=status.HTTP_400_BAD_REQUEST)

        if room is None:
            return Response({"detail": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host.id, endpoint)

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


# class PauseSong(APIView):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAuthenticated]

#     def put(self, response, format=None):
#         user = request.user
#         room = Room.objects.filter(
#             host=user
#         ).first()
#         room_code = room.code

#         if not room_code:
#             return Response(
#                 {"message": "Room code not found in session."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         room = Room.objects.filter(code=room_code).first()
#         if not room:
#             return Response(
#                 {"message": "Room not found."}, status=status.HTTP_404_NOT_FOUND
#             )

#         # Check if the user is the host or guest can pause
#         if self.request.session.session_key == room.host or room.guest_can_pause:
#             pause_song(room.host)
#             return Response({}, status=status.HTTP_204_NO_CONTENT)

#         return Response({}, status=status.HTTP_403_FORBIDDEN)


# class PlaySong(APIView):
#     def put(self, response, format=None):
#         user = request.user
#         room = Room.objects.filter(
#             host=user
#         ).first()
#         room_code = room.code
#         if not room_code:
#             return Response(
#                 {"message": "Room code not found in session."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         room = Room.objects.filter(code=room_code).first()
#         if not room:
#             return Response(
#                 {"message": "Room not found."}, status=status.HTTP_404_NOT_FOUND
#             )

#         # Check if the user is the host or guest can play
#         if self.request.session.session_key == room.host or room.guest_can_pause:
#             play_song(room.host)
#             return Response({}, status=status.HTTP_204_NO_CONTENT)

#         return Response({}, status=status.HTTP_403_FORBIDDEN)
