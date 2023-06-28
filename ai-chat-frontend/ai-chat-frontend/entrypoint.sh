#!/bin/sh

# Set environment variables
bundlefile="$(ls $PATH_TO_ENVIRONMENT_VARIABLES/main.*.js 2>/dev/null)"

# Replace backend and oauth config
if [[ -f "$bundlefile" ]]; then
    echo SET ENVIRONMENT VARIABLES
    test ! -r $bundlefile.orig && cp $bundlefile $bundlefile.orig
    sed -i -r "s|###REST_API_URL###|$REST_API_URL|g" $bundlefile
    sed -i -r "s|###DEPLOYMENT_ENVIRONMENT###|$DEPLOYMENT_ENVIRONMENT|g" $bundlefile
    sed -i -r "s|###ACTIVATE_AUTHENTICATION###|$ACTIVATE_AUTHENTICATION|g" $bundlefile
    sed -i -r "s|###KEYCLOAK_AUTHENTICATION_URL###|$KEYCLOAK_AUTHENTICATION_URL|g" $bundlefile
    sed -i -r "s|###PWC_IDENTITY_LOGOUT_URL###|$PWC_IDENTITY_LOGOUT_URL|g" $bundlefile
    sed -i -r "s|###KEYCLOAK_REALM###|$KEYCLOAK_REALM|g" $bundlefile
    sed -i -r "s|###KEYCLOAK_CLIENT###|$KEYCLOAK_CLIENT|g" $bundlefile
    sed -i -r "s|###BACKEND_URL###|$BACKEND_URL|g" $bundlefile
else
    echo NO ENVIRONMENT VARIABLES SET!
fi

proxyconf="/etc/nginx/conf.d/proxy.conf"
if [[ -f "$proxyconf" ]]; then
    echo fixing $proxyconf
    sed -i -r "s|###REST_API_URL###|$REST_API_URL|g" $proxyconf
    test ! -r $proxyconf.orig && cp $proxyconf etc/nginx/conf.d/default.conf
    rm /etc/nginx/conf.d/proxy.conf
else
    echo no frontend config, no fixing
fi

#Start nginx
nginx -g "daemon off;"
