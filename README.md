# s3-lambda-thumbnail
0.Create two bucket (Source and Destination),the destination add a surfix(-thumbnails) of source bucket.
1.Create a new role in IAM with AWSLambdaExecute policy.
2.Create a new function in Lambda with role above.
3.Create a new function with name 'CreateThumbnail'
4.Add a new triger with source s3 bucket name and choose CreateObjectByPut.
5.download this zip file and upload to lambda configuration.
6.change handler to CreateThumbnail.handler
7.choose Nodejs 4.3

remeber to use zip -r pack.zip * to pack all the file if you modified js file.
