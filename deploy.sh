#!/bin/zsh
rm samconfig.toml
rm -rf .aws-sam/
echo "------------Starting validating-------"
samlocal validate
echo "-------- validation done-----"
echo "-------- build starting -----"
samlocal build
echo "------- build done ----------"
echo "------- deploy  start ----------"
samlocal deploy --guided
echo "------- deploy done ----------"
echo "-------Api gateway"
aws --endpoint-url=http://localhost:4566/ apigateway get-rest-apis