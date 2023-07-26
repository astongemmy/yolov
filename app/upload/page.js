'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image'
import axios from 'axios'

const axiosOptions = {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onUploadProgress: (event) => {
    const uploadprogress = Math.round((event.loaded * 100) / event.total);
    console.log(`Current progress: `, uploadprogress);
  }
};

export default function Home() {
  const [responseMessage, setResponseMessage] = useState();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isUploading || isProcessing) {
      setResponseMessage('');
    }
  }, [isUploading, isProcessing])
  
  const uploadToCloudStorage = async (e) => {
    e.preventDefault();

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    
    try {
      const { data } = await axios.post('/api', formData, axiosOptions);
      setResponseMessage(data.message);
      setIsUploading(false);

      if (data.status) sendFileToApi(data.data);
    } catch(error) {
      console.log('An error occurred while trying to upload your file(s). ', error);
      const errorMessage = error?.response?.data?.message || 'An error occurred!';
      setResponseMessage(errorMessage);
      setIsUploading(false);
    }
  };

  const sendFileToApi = async (files) => {
    const apiUrl = 'https://mp-api-app-zgymkx5l6a-uc.a.run.app/predict';
    const body = files.map(({ name, url }, index) => {
      const fileKey = `img_${index}`;
      const newFile = { name, url };
      newFile[fileKey] = url;
      return newFile;
    });

    setIsProcessing(true);
    
    try {
      const response = await axios.post(apiUrl, body);
      // setResponseMessage(data.message);
      setIsProcessing(false);
      console.log(response);
    } catch(error) {
      console.log('An error occurred while trying to process your file(s). ', error);
      const errorMessage = error?.response?.data?.message || 'An error occurred!';
      setResponseMessage(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleFilesChange = (e) => {
    const selectedFiles = [...e.target.files];
    setPreviewFiles(selectedFiles.forEach((file) => URL.createObjectURL(file)));
    setFiles(selectedFiles);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          MPDiag Application
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel Logo"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <form className="mb-8" onSubmit={uploadToCloudStorage}>
        <input type="file" name="files" onChange={handleFilesChange} multiple />
        <button type="submit">Submit</button>

        {(responseMessage || isUploading || isProcessing) && (
          <div>
            {isProcessing && 'Processing files...'}
            {isUploading && 'Uploading files...'}
            {responseMessage && responseMessage}
          </div>
        )}
      </form>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore the Next.js 13 playground.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}