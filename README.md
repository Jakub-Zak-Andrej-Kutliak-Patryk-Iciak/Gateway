## Parking app gateway

Generate RSA key pair and save them in the root directory:

```
ssh-keygen -t rsa -P "" -b 4096 -m PEM -f jwtRS256.key
```

```
ssh-keygen -e -m PEM -f jwtRS256.key > jwtRS256.key.pub
```