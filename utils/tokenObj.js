 const accessTokenobj={
            httpOnly: true,
            secure: false,   
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        };

 const refreshTokenobj={
            httpOnly: true,
            secure: false,  
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        module.exports={
            accessTokenobj,
            refreshTokenobj
        };