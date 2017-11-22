# s3-lambda-thumbnail
0.Create two bucket (Source and Destination),the destination add a surfix(-thumbnails) of source bucket.
1.Create a new role in IAM with AWSLambdaExecute policy.
2.Create a new function in Lambda with role above.
remeber to use zip -r pack.zip * to pack all the file if you modified js file.
