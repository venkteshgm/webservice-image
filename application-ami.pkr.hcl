packer {

  required_plugins {

    amazon = {

      version = ">= 0.0.2"

      source = "github.com/hashicorp/amazon"

    }

  }

}
variable "ami_name"{
  type = string
  default = "CSYE-6225-assignment-4"
}
variable "AWS_ACCESS_KEY_ID" {
  type    = string
  default = ""
}

variable "AWS_SECRET_ACCESS_KEY" {
  type    = string
  default = ""
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-033b95fb8079dc481"
}

variable "ssh_username" {
  type = string
  default = "ec2-user"
}

source "amazon-ebs" "custom-ami" {
  access_key      = "${var.AWS_ACCESS_KEY_ID}"
  ami_description = "Amazon Linux 2 AMI for CSYE 6225"
  ami_name        = "CSYE-6225-AMI"
  instance_type   = "t2.micro"
  region          = "${var.aws_region}"
  secret_key      = "${var.AWS_SECRET_ACCESS_KEY}"
  source_ami      = "${var.source_ami}"
  force_deregister = true
  force_delete_snapshot = true
  ssh_username    = "${var.ssh_username}"
  ami_users       = ["548078780925"]
  #vpc_id          = "vpc-088fa53e888d8d490"
  #subnet_id       = "subnet-02203939d7c0a46ec"
  vpc_filter {
    filters = {
      #"tag:Class": "build",
      "isDefault": "true",
      #"cidr": "/24"
    }
  }
}


build {
  name    = "custom-ami-builder"
  sources = ["source.amazon-ebs.custom-ami"]

  provisioner "file" {
    source      = "webservice.zip"
    destination = "~/"
  }

  provisioner "shell" {

    inline = [

      "cd ~",

      "sudo mkdir -p webservice",

      "sudo chmod 755 webservice",

      "sudo unzip webservice.zip -d ~/webservice"

    ]

  }

  provisioner "shell" {

    scripts = [

      "installer.sh"

    ]
  }




}
