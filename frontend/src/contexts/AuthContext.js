import React, { useContext, useState } from 'react'
import jwt_decode from "jwt-decode";

const AuthContext = React.createContext()

export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider( { children }) {


    const [currentUser, setCurrentUser] = useState()

    if(currentUser == null){
        const user = localStorage.getItem("user");
        if(user){
            setCurrentUser(JSON.parse(user))
        }
    }

    async function login(username, password){

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username,
                password: password})
        };

        await fetch(process.env.REACT_APP_AUTH_BASE_URL + "/api/v1/login", requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data){
                const tokenData = jwt_decode(data.accessToken);
                const user = {accessToken : "Bearer " + data.accessToken, refreshToken : data.refreshToken, username: tokenData.username}
                setCurrentUser(user);
                localStorage.setItem("user", JSON.stringify(user))
                return user    
            } else {
                console.log("Failed login")
            }
            
        }).catch(error => {
            console.error(error)
        })       
   
    }

    async function refreshToken(){

        

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                refreshToken : currentUser.refreshToken
            })
        };

        await fetch(process.env.REACT_APP_AUTH_BASE_URL + "/api/v1/refreshtoken", requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data){
                const user = {...currentUser}
                user.accessToken = "Bearer " + data.accessToken
                setCurrentUser(user);
                localStorage.setItem("user", JSON.stringify(user))
                return user    
            } else {
                console.log("Failed to refresh token")
            }
            
        }).catch(error => {
            console.error(error)
        })        
    }

    function logout(){
        const user = null;
        setCurrentUser(user);
        localStorage.removeItem("user")
        return user;

    }

    const value = {
        currentUser,
        refreshToken,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
