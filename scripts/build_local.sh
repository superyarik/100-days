#!/bin/bash

platform=$1

# set the app build file extension
if [ "$1" == "ios" ]; then
  profile=$2
  
  if [ -z ${2+x} ]; then
    echo "You must specify either 'simulator' or 'device' for iOS";
    exit 1
  fi

  if [ "$2" == "device" ]; then
    profile="development"
  fi
else
    build_ext=".apk"
fi


# set the build output directory and pipe env vars to the build command
# so that the eas-build-pre-install script pipes receives the mapbox token
# ensure you have the most up-to-date .env file in apps/mobile
EAS_LOCAL_BUILD_ARTIFACTS_DIR=./build/$platform eas build -p $platform -e $profile --local --clear-cache
