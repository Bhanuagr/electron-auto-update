mkdir -p binary
# if not exist "binary" mkdir binary
cd binary && rm -rf win mac linux
mkdir win
cd ..
mkdir -p temp
# if not exist "temp" mkdir temp
cd temp && rm -rf win
mkdir win && cd win
curl https://github.com/DeFiCh/ain/releases/download/v1.0.0-rc1/defichain-1.0.0-rc1-x86_64-w64-mingw32.zip -O defichain-1.0.0-rc1-x86_64-w64-mingw32.zip
unzip defichain-1.0.0-rc1-x86_64-w64-mingw32.zip
# unzip -o "defichain-1.0.0-rc1-x86_64-w64-mingw32.zip" "defichain-1.0.0-rc1-x86_64-w64-mingw32.zip" 
copy defichain-1.0.0-rc1/bin/defid.exe .
cd ../.. && cp temp/win/defid.exe binary/win/defid.exe
chmod 777 binary/win/defid.exe
