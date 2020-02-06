// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({ imageMagick: true }); // Enable ImageMagick integration.
var util = require('util');

// constants
var MIN_SIDE = 300;

// get reference to S3 client
var s3 = new AWS.S3();

exports.handler = function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
        decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    var dstBucket = srcBucket + "-thumbnails";
    var dstKey    = "thumbnail_" + srcKey;

    // Sanity check: validate that source and destination are different buckets.
    if (srcBucket == dstBucket) {
        callback("Source and destination buckets are the same.");
        return;
    }

    // Infer the image type.
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        callback("Could not determine the image type.");
        return;
    }
    var imageType = typeMatch[1];
    if (imageType != "jpg" && imageType != "png" && imageType!="gif" && imageType!="jpeg" && imageType!="bmp") {
        callback('Unsupported image type: ${imageType}');
        return;
    }
    
    s3.getObject({
            Bucket: srcBucket,
            Key: srcKey
        },
        function (err,data) {
            if (err)
                console.log(err, err.stack);
            else {
                console.log(data);
                gm(data.Body).size(function(err, size) {
                    if (err)
                        console.log(err, err.stack);
                    else {
                        // Infer the scaling factor to avoid stretching the image unnaturally.
                        var width;
                        var height;

                        var minSize = Math.min(size.width, size.height);
                        if(minSize === size.width)
                        {
                            width = MIN_SIDE;
                            height = MIN_SIDE*size.height/size.width;
                        }
                        else
                        {
                            height = MIN_SIDE;
                            width = MIN_SIDE*size.width/size.height;
                        }

                        // Transform the image buffer in memory.
                        this.resize(width, height)
                            .toBuffer(imageType, function(err, buffer) {
                                if (err) {
                                    console.log(err, err.stack);
                                } else {
                                    s3.putObject({
                                            Bucket: dstBucket,
                                            Key: dstKey,
                                            Body: buffer,
                                            ContentType: imageType
                                        },
                                        function (err,data) {
                                            if (err) {
                                                console.log(err, err.stack);
                                            }
                                        });
                                }
                            });
                    }
                });
            }

        });
};

