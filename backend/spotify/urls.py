from django.urls import path
from .views import *

urlpatterns = [
    path("get-auth-url", AuthURL.as_view()),
    path("redirect", spotify_callback),
    path("is-spotify-authenticated", IsSpotifyAuthenticated.as_view()),
    path("current-song", CurrentSong.as_view()),
    path("pause", PauseSong.as_view(), name="pause-song"),
    path("play", PlaySong.as_view(), name="play-song"),
    path("spotify-user-profile", SpotifyUserProfile.as_view()),
    path("spotify-logout", SpotifyLogout.as_view(), name="spotify-logout"),
]
