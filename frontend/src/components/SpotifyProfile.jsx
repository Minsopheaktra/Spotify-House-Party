import React, { useState, useEffect } from "react";
import {
	Typography,
    Avatar,
    IconButton,
} from "@mui/material";
import { getSpotifyUserProfile } from "../spotifyApi";

const SpotifyProfile = () => {
    const [profileData, setProfileData] = useState({ imageUrl: null, display_name: '' });

    useEffect(() => {
        const fetchSpotifyUserProfile = async () => {
            try {
                const { images, display_name } = await getSpotifyUserProfile();
                // Get the URL of the largest image (first in the array)
                const imageUrl = images && images.length > 0 ? images[0].url : null;
                setProfileData({ imageUrl, display_name });
            } catch (error) {
                console.error("Error fetching Spotify user profile:", error);
            }
        };

        fetchSpotifyUserProfile();
    }, []);

    return (
            <IconButton>
                <Avatar src={profileData.imageUrl} alt={profileData.display_name} />
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        ml: 1,
                        display: { xs: 'none', sm: 'block' }
                    }}
                >
                    {profileData.display_name}
                </Typography>
            </IconButton>
    );
};

export default SpotifyProfile;
