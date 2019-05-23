### Easy put React files to AWS S3 Bucket module.

Command line utility for fast and simple deployment React application
to S3 Bucket through aws-cli.

#### Dependencies

```
aws-cli
```

#### Instalation

```
npm install react-to-s3
```

#### Usage

First run `npm build` to create directory /build with deployment files of 
React applications.

Then:

```
node node_modules/react-to-s3/index <bucketName>
```
