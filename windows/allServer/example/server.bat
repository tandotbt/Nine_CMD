echo off
color 06
chcp 65001
cls
set "_cdNow=%~dp0"
echo %_cdNow%
cd ..\..
set "_cd=%cd%"
echo Location: %_cd%
echo.└── %_cdNow%
echo %time:~0,8% Start server 9CMD >> "%_cdNow%\log.txt"
echo %time:~0,8% └── %_cd% >> "%_cdNow%\log.txt"
echo %time:~0,8% └── %_cdNow% >> "%_cdNow%\log.txt"
:taoLinkJsonBlod
set _file="%_cdNow%\_urlJson.txt"
if exist "%_file%" (goto :ktraJsonBlob)
echo %time:~0,8% └── Creat link server from jsonblob.com ... >> "%_cdNow%\log.txt"
cd "%_cdNow%"
curl -i -X "POST" -d "{\"rand\":1}" -H "Content-Type: application/json" -H "Accept: application/json" https://jsonblob.com/api/jsonBlob --insecure --silent|findstr /i location>nul> _temp.txt 2>nul
set /p _temp=<_temp.txt
echo %time:~0,8% └──── %_temp% >> "%_cdNow%\log.txt"
echo %_temp:~43,19%> _urlJson.txt 2>nul & set "_temp=" & del /q _temp.txt 2>nul
:ktraJsonBlob
set /p _urlJson=<"%_cdNow%\_urlJson.txt"
echo %time:~0,8% └── Check link server %_urlJson% ... >> "%_cdNow%\log.txt"
curl -H "Content-Type: application/json" -H "Accept: application/json" https://jsonblob.com/api/jsonBlob/%_urlJson% --insecure 2>nul|"%_cd%\moduns\jq.exe" -s "flatten|.[0]|has(\"rand\")"|findstr /i false>nul
if %errorlevel% == 0 (
	del /q "%_cdNow%\_urlJson.txt" 2>nul
	echo %time:~0,8% └──── Del link %_urlJson% >> "%_cdNow%\log.txt"
	goto :taoLinkJsonBlod
	)
echo %time:~0,8% └──── Use link %_urlJson% >> "%_cdNow%\log.txt"	
REM Set /a _rand=(%RANDOM%*(max-min+1)/32768)+min
Set /a _rand=(%RANDOM%*(30000-10000+1)/32768)+10000
set "_mainFolder=%_cd%\temp\%_rand%"
if exist "%_mainFolder%" (rd /s /q "%_mainFolder%")
md %_mainFolder%
copy "%_cd%\moduns\jq.exe" "%_mainFolder%\jq.exe" >nul

cd "%_mainFolder%"
title [Server 9cmd website]
color 06
set "_passwordServer=12345"
echo Set password server (Default 12345)
set /P "=_" < NUL > "Enter password"
findstr /A:1E /V "^$" "Enter password" NUL > CON
del "Enter password"
set /P "_passwordServer="
cls
color 06
echo.
echo Location %_mainFolder%
echo Url server %_urlJson%
echo %time:~0,8% └── %_mainFolder% >> "%_cdNow%\log.txt"
echo %time:~0,8% └──── Server: %_urlJson% >> "%_cdNow%\log.txt"
echo %time:~0,8% └──── Password: %_passwordServer% >> "%_cdNow%\log.txt"
echo %time:~0,8% └──── Link: https://jsonblob.com/api/%_passwordServer%/%_urlJson% >> "%_cdNow%\log.txt"
curl "https://jsonblob.com/api/jsonBlob/%_urlJson%" --insecure --silent > response1.json
jq -c "." response1.json > previousData.json
curl -X PUT -H "Content-Type: application/json" -d "@previousData.json" "https://jsonblob.com/api/%_passwordServer%/%_urlJson%" --insecure --silent >nul

:loop
echo Listening ... CTRL + C to pause server, N to continue
echo %time:~0,8% └── Listening ... >> "%_cdNow%\log.txt"
curl "https://jsonblob.com/api/%_passwordServer%/%_urlJson%" --insecure --silent > response2.json
jq -c "." response2.json > currentData.json
REM jq -r "\"Rand hiện tại \(.rand)\"" currentData.json
REM jq -r "\"Rand trước đó \(.rand)\"" previousData.json
type currentData.json previousData.json > _temp.json 2>nul
jq -s "if (.[0] == .[1]) then true else false end" _temp.json | findstr /i false>nul
if %errorlevel% == 0 (
		echo.
        echo.Working ...
		echo %time:~0,8% └── Working ... >> "%_cdNow%\log.txt"
		jq -c "{password,rand: (.rand - 1),Address9c,request, data: \"error: File UTC not found\"}" "%_mainFolder%\currentData.json" > "%_mainFolder%\previousData.json"
		call :letGo
		cd "%_mainFolder%"
        curl -X PUT -H "Content-Type: application/json" -d "@previousData.json" "https://jsonblob.com/api/%_passwordServer%/%_urlJson%" --insecure --silent
		echo.
	)


timeout 1 >nul
goto :loop

:letGo
Set /a _rand=(%RANDOM%*(3000-1000+1)/32768)+1000
set "_folderRand=%_mainFolder%\%_rand%"
if exist "%_folderRand%" (rd /s /q "%_folderRand%")
md "%_folderRand%"
copy "jq.exe" "%_folderRand%\jq.exe" >nul
cd "%_folderRand%"
echo Location %_folderRand%
set "_request=" & set "_password=" & set "_Address9c="
jq -r ".request" "%_mainFolder%\currentData.json" > _request.txt & set /p _request=<_request.txt
jq -r ".password" "%_mainFolder%\currentData.json" > _password.txt & set /p _password=<_password.txt
jq -r ".Address9c" "%_mainFolder%\currentData.json" > _Address9c.txt & set /p _Address9c=<_Address9c.txt
echo %time:~0,8% └──── %_folderRand% >> "%_cdNow%\log.txt"
echo %time:~0,8% └──── Address: %_Address9c% >> "%_cdNow%\log.txt"
echo %time:~0,8% └──── Password: %_password% >> "%_cdNow%\log.txt"
echo %time:~0,8% └──── Request: %_request% >> "%_cdNow%\log.txt"
set /a _checkUTC=0
call :getkeyID
if %_checkUTC% == 0 (echo %time:~0,8% └──── Error: Missing UTC file of address %_Address9c% >> "%_cdNow%\log.txt" & goto:eof)
if "%_request%" equ "getPublicKey" (call :getPublicKey)
if "%_request%" equ "getSignature" (call :getSignature)

goto:eof

:getKeyID
"%_cd%\Planet\planet.exe" key --path "%_cd%\User\UTC" > allUTC.txt 2>nul
set "_keyId="
jq --arg value "%_Address9c%" -Rn -r "[inputs | split(\" \") | {key: .[0], value: .[1]}] | .[] | select((.value | ascii_downcase) == ($value | ascii_downcase)) | .key" allUTC.txt > _keyID.txt
set /p _keyID=<_keyID.txt
if not "%_keyID%" == "" (set /a _checkUTC=1)
goto:eof

:getPublicKey
"%_cd%\Planet\planet" key export --passphrase %_password% --public-key --path "%_cd%\user\utc" %_keyID% > _publickey.txt 2> _error.txt 
set "_publickey=" & set "_error="
set /p _publickey=<_publickey.txt
for /f "usebackq delims=" %%B in ("_error.txt") do (
	set "_error=%%B"
)
if defined _publickey (
    jq -c "{password,rand: (.rand + 1),Address9c,request, data: \"%_publickey%\"}" "%_mainFolder%\currentData.json" > "%_mainFolder%\previousData.json"
	echo %time:~0,8% └──── Success: %_publickey% >> "%_cdNow%\log.txt"
) else (
    jq -c "{password,rand: (.rand - 1),Address9c,request, data: \"%_error%\"}" "%_mainFolder%\currentData.json" > "%_mainFolder%\previousData.json"
	echo %time:~0,8% └──── Error: %_error% >> "%_cdNow%\log.txt"
)
goto:eof

:getSignature
cd %_folderRand%
set "_unsignedTransaction="
jq -r ".data" "%_mainFolder%\currentData.json" > _unsignedTransaction.txt
for /f "usebackq delims=" %%B in ("_unsignedTransaction.txt") do (
	set "_unsignedTransaction=%%B"
)
call certutil -decodehex _unsignedTransaction.txt action >nul
"%_cd%\Planet\planet" key sign --passphrase %_password% --store-path "%_cd%\user\utc" %_keyID% action> _signature.txt 2> _error.txt
set "_signature=" & set "_error="
for /f "usebackq delims=" %%B in ("_signature.txt") do (
	set "_signature=%%B"
)
REM set /p _signature=<_signature.txt
for /f "usebackq delims=" %%B in ("_error.txt") do (
	set "_error=%%B"
)
if defined _signature (
    jq -c "{password,rand: (.rand + 1),Address9c,request, data: \"%_signature%\"}" "%_mainFolder%\currentData.json" > "%_mainFolder%\previousData.json"
	echo %time:~0,8% └──── Success: %_signature% >> "%_cdNow%\log.txt"
) else (
    jq -c "{password,rand: (.rand - 1),Address9c,request, data: \"%_error%\"}" "%_mainFolder%\currentData.json" > "%_mainFolder%\previousData.json"
	echo %time:~0,8% └──── Error: %_error% >> "%_cdNow%\log.txt"	
)
goto:eof