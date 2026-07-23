resource "aws_security_group" "open" {
  name        = "demo-open-sg"
  description = "Demo security group"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_s3_bucket" "demo" {
  bucket = "demo-review-bucket"
}
