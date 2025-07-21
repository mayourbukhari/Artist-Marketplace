@echo off
echo Installing Artist Marketplace dependencies...
echo.

echo Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    exit /b %errorlevel%
)

echo.
echo Installing client dependencies...
cd client
npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    exit /b %errorlevel%
)

cd ..
echo.
echo Setup complete! You can now run:
echo   npm run dev    - Start both client and server
echo   npm run server - Start only the server
echo   npm run client - Start only the client
echo.
echo Make sure to configure your .env file with your API keys before running!
