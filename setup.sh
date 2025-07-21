#!/bin/bash

echo "Installing Artist Marketplace dependencies..."
echo

echo "Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install root dependencies"
    exit 1
fi

echo
echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install client dependencies"
    exit 1
fi

cd ..
echo
echo "Setup complete! You can now run:"
echo "  npm run dev    - Start both client and server"
echo "  npm run server - Start only the server"
echo "  npm run client - Start only the client"
echo
echo "Make sure to configure your .env file with your API keys before running!"
