$ curl -s -c cookies.txt -X POST http://localhost:5001/customer/login -H 'Content-Type: application/json' -d '{"username":"jose","password":"test1234"}'
{"message":"User successfully logged in"}
