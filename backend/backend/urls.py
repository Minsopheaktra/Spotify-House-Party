from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("user-api-auth/", include("rest_framework.urls")),
    path("user-api/", include("user_api.urls")),
    path("room-api/", include("room_api.urls")),
    path("spotify/", include("spotify.urls")),
]
