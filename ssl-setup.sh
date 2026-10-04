#!/bin/bash
# Waits for domain delegation, then issues SSL and disables itself
IP=$(getent ahostsv4 karat-titan.ru | awk 'NR==1{print $1}')
if [ "$IP" = "62.109.2.236" ]; then
  certbot --nginx -d karat-titan.ru -d www.karat-titan.ru \
    --non-interactive --agree-tos --register-unsafely-without-email --redirect \
    >> /var/log/ssl-setup.log 2>&1
  if [ $? -eq 0 ]; then
    echo "$(date) SSL issued" >> /var/log/ssl-setup.log
    crontab -l | grep -v ssl-setup.sh | crontab -
  fi
fi
