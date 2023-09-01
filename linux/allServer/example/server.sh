#!/bin/bash
printf '\033[93m'
cd "$(dirname "$0")"
_cdNow=$(pwd)
cd ..
cd ..
_cd=$(pwd)
cd $_cdNow
echo "Location: $_cd"
echo "└── $_cdNow"
echo "$(date +"%T") Start server 9CMD" >> "${_cdNow}/log.txt"
echo "$(date +"%T") └── $_cd" >> "${_cdNow}/log.txt"
echo "$(date +"%T") └── $_cdNow" >> "${_cdNow}/log.txt"

taoLinkJsonBlod() {
	echo "$(date +"%T") └── Creat link server from jsonblob.com" >> "${_cdNow}/log.txt"
	cd "${_cdNow}" || exit
	_temp=$(curl -i -X "POST" -d "{\"rand\":1}" -H "Content-Type: application/json" -H "Accept: application/json" https://jsonblob.com/api/jsonBlob --silent | grep -i location | cut -d ' ' -f 2)
	_id=$(basename "${_temp}")
	echo "$(date +"%T") └──── ${_id}" >> "${_cdNow}/log.txt"
	echo "${_id}" > "${_cdNow}/_urlJson.txt" 2>/dev/null
	unset _temp
	rm -f _temp.txt 2>/dev/null
}

ktraJsonBlob() {
	_urlJson=$(grep -o '[0-9]*' "${_cdNow}/_urlJson.txt")
	echo "$(date +"%T") └── Check link server ${_urlJson}" >> "${_cdNow}/log.txt"
	_temp=$(curl -H "Content-Type: application/json" -H "Accept: application/json" https://jsonblob.com/api/jsonBlob/${_urlJson} --silent | jq -s 'flatten | .[0] | has("rand")')
		if [[ $_temp == false ]]; then
		rm -f "${_cdNow}/_urlJson.txt" 2>/dev/null
		echo "$(date +"%T") └──── Del link ${_urlJson}" >> "${_cdNow}/log.txt"
		else
		echo "$(date +"%T") └──── Link ${_urlJson} ok" >> "${_cdNow}/log.txt"
		fi
}

max_attempts=10
attempt=0
while [ $attempt -lt $max_attempts ]
do
  _file="${_cdNow}/_urlJson.txt"
  if [ -f "$_file" ]; then
    
    ktraJsonBlob
  else
    taoLinkJsonBlod
    ktraJsonBlob
  fi

  if [ -f "$_file" ]; then
    break
  fi

  ((attempt++))
done

if [ "$attempt" -eq "$max_attempts" ]; then
  echo "Maximum number of attempts reached."
fi


#!/bin/bash

# Append to log.txt
echo "$(date +"%T") └──── Use link $_urlJson" >> "${_cdNow}/log.txt"

# Generate random number between 10000 and 30000
_rand=$(( RANDOM % (30000 - 10000 + 1) + 10000 ))

# Set main folder path
_mainFolder="${_cd}/temp/$_rand"

# Check if main folder exists and remove it
if [[ -d "$_mainFolder" ]]; then
  rm -rf "$_mainFolder"
fi

# Create main folder
mkdir -p "$_mainFolder"

# Change directory to main folder
cd "$_mainFolder"

# Prompt user for password and store it securely
read -s -p "Set password server (Default 12345): " passwordInput
_passwordServer=${passwordInput:-"12345"}



# Download JSON response from the server
curl https://jsonblob.com/api/jsonBlob/$_urlJson --silent > response1.json

# Format JSON using jq and save to previousData.json
jq -c '.' response1.json > previousData.json 2>/dev/null

# Upload previousData.json to the server
curl -X PUT -H "Content-Type: application/json" -d "@previousData.json" https://jsonblob.com/api/$_passwordServer/$_urlJson --silent


getKeyID() {
  "$_cd/Planet/planet" key --path "$_cd/User/UTC" > allUTC.txt 2>/dev/null
  _keyID=$(jq --arg value "$_Address9c" -Rn -r 'inputs | split(" ") | {key: .[0], value: .[1]} | select((.value | ascii_downcase) == ($value | ascii_downcase)) | .key' allUTC.txt)
  if [ -n "$_keyID" ]; then
    _checkUTC=1
  fi
}

letGo() {
  _rand=$((RANDOM*(3000-1000+1)/32768+1000))
  _folderRand="$_mainFolder/$_rand"

  if [ -d "$_folderRand" ]; then
    rm -rf "$_folderRand"
  fi
  mkdir "$_folderRand"

  cd "$_folderRand"
  echo "Location $_folderRand"
  _request=""
  _password=""
  _Address9c=""

  _request=$(jq -r ".request" "$_mainFolder/currentData.json")
  _password=$(jq -r ".password" "$_mainFolder/currentData.json")
  _Address9c=$(jq -r ".Address9c" "$_mainFolder/currentData.json")

  echo "$(date +"%T") └──── $_folderRand" >> "$_cdNow/log.txt"
  echo "$(date +"%T") └──── Address: $_Address9c" >> "$_cdNow/log.txt"
  echo "$(date +"%T") └──── Password: $_password" >> "$_cdNow/log.txt"
  echo "$(date +"%T") └──── Request: $_request" >> "$_cdNow/log.txt"

  _checkUTC=0
  getKeyID
  if [ $_checkUTC -eq 0 ]; then
    echo "$(date +"%T") └──── Error: Missing UTC file of address $_Address9c" >> "$_cdNow/log.txt"
    return
  fi
  if [ "$_request" = "getPublicKey" ]; then
    getPublicKey
  fi

  if [ "$_request" = "getSignature" ]; then
    getSignature
  fi
}

getPublicKey() {
  cd "$_folderRand"
  "$_cd/Planet/planet" key export --passphrase "$_password" --public-key --path "$_cd/User/UTC" "$_keyID" > _publickey.txt 2> _error.txt
  _publickey=$(< _publickey.txt)
  _error=$(< _error.txt)

  if [ -n "$_publickey" ]; then
    jq -c "{password,rand: (.rand + 1),Address9c,request, data: \"$_publickey\"}" "$_mainFolder/currentData.json" > "$_mainFolder/previousData.json"
    echo "$(date +"%T") └──── Success: $_publickey" >> "$_cdNow/log.txt"
  else
    jq -c "{password,rand: (.rand - 1),Address9c,request, data: \"$_error\"}" "$_mainFolder/currentData.json" > "$_mainFolder/previousData.json"
    echo "$(date +"%T") └──── Error: $_error" >> "$_cdNow/log.txt"
  fi
}

getSignature() {
  cd "$_folderRand"
  _unsignedTransaction=$(jq -r ".data" "$_mainFolder/currentData.json")

  echo "$_unsignedTransaction" > _unsignedTransaction.txt
  echo "$_unsignedTransaction" | xxd -r -p > action

  "$_cd/Planet/planet" key sign --passphrase "$_password" --store-path "$_cd/User/UTC" "$_keyID" action > _signature.txt 2> _error.txt
  _signature=$(< _signature.txt)
  _error=$(< _error.txt)

  if [ -n "$_signature" ]; then
    jq -c "{password,rand: (.rand + 1),Address9c,request, data: \"$_signature\"}" "$_mainFolder/currentData.json" > "$_mainFolder/previousData.json"
    echo "$(date +"%T") └──── Success: $_signature" >> "$_cdNow/log.txt"
  else
    jq -c "{password,rand: (.rand - 1),Address9c,request, data: \"$_error\"}" "$_mainFolder/currentData.json" > "$_mainFolder/previousData.json"
    echo "$(date +"%T") └──── Error: $_error" >> "$_cdNow/log.txt"
  fi
}

clear

echo

# Display location
echo "Location: $_mainFolder"

# Display server URL
echo "Server URL: $_urlJson"

# Append to log.txt
echo "$(date +"%T") └── $_mainFolder" >> "${_cdNow}/log.txt"
echo "$(date +"%T") └──── Server: $_urlJson" >> "${_cdNow}/log.txt"
echo "$(date +"%T") └──── Password: $_passwordServer" >> "${_cdNow}/log.txt"
echo "$(date +"%T") └──── Link: https://jsonblob.com/api/$_passwordServer/$_urlJson" >> "${_cdNow}/log.txt"
while true; do
  echo "Listening ... CTRL + C to stop"
  echo "$(date +"%T") └── Listening ..." >> "${_cdNow}/log.txt"

  # Download JSON response from the server
  curl "https://jsonblob.com/api/$_passwordServer/$_urlJson" --silent > response2.json

  # Format JSON using jq and save to currentData.json
  jq -c "." response2.json > currentData.json

  # Concatenate currentData.json and previousData.json to _temp.json
  cat currentData.json previousData.json > _temp.json 2>/dev/null

  # Compare the contents of _temp.json and check if they are different
  _temp=`jq -s 'if .[0] == .[1] then false else true end' _temp.json`
  if [[ $_temp == true ]]; then
    echo
    echo "Working ..."
    echo "$(date +"%T") └── Working ..." >> "${_cdNow}/log.txt"

    # Modify and save previousData.json using jq
    jq -c '{ password, rand: (.rand - 1), Address9c, request, data: "error: File UTC not found" }' "$_mainFolder/currentData.json" > "$_mainFolder/previousData.json"

    letGo

    cd "$_mainFolder"
    # Upload previousData.json to the server
    curl -X PUT -H "Content-Type: application/json" -d "@previousData.json" "https://jsonblob.com/api/$_passwordServer/$_urlJson" --silent 
	echo
  fi

  sleep 1
done