import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import { IconButton } from "@mui/material"

const Logout = () => {
    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        window.location.href = "/"
    }
    return (
            <IconButton 
                onClick={logout}
                sx={{
                    color: 'black',
                    '&:hover': {
                        backgroundColor: 'secondary.main',
                    },
                }}
            >
                Sign out
            </IconButton>
    )
}

export default Logout