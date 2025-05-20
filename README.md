content = all the vocabulary and image links sorted by language - requires Target_Language to work

gsap = all animation functions

image_handler = grabs images from AWS S3 "corsbucket" and injects into img-frame

text_handler = grabs text from json based on currentNumber and Target_Language

voice_handler = grabs text from json based on currentNumber and Target_Language, forms API request to Narakeet via API Gateway on AWS.
