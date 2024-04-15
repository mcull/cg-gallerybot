import React, { useState, useEffect } from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { useForm } from "react-hook-form"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const checkOrIcon = (phase, currentPhase, icon) => {
  return currentPhase%7 > phase ? "✅" : icon
}

const IndexPage = () => {

  const [metaMsg, setMetaMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [botEmailCopied, setBotEmailCopied] = useState(false);
  const [spreadsheetUrlPasted, setSpreadsheetUrlPasted] = useState(false);
  const [describeArtClicked, setDescribeArtClicked] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [describedCount, setDescribedCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = data => {
    console.log(data);
    fetch(`/api/images`, {
      method: `POST`,
      body: JSON.stringify(data),
      headers: {
        "content-type": `application/json`,
      },
    })
      .then(res => res.json())
      .then(body => {
        if (body.error) {
          setErrorMsg(body.error);
        } else {
          const images = body.images;
          const imageCount = images.length;
          setMetaMsg(`${imageCount} images found. Descriptions are being generated...`);
          setImageCount(imageCount);

          const describeImage = (images, index) => {
            if (index >= images.length) { return; }
            
            fetch(`/api/describe`, {
              method: `POST`,
              body: JSON.stringify({ image: images[index] }),
              headers: {
                "content-type": `application/json`,
              },
            })
            .then(res => res.json())
            .then(body => {
              if (body.error) {
                setErrorMsg(body.error);
              } else {
                setDescribedCount(index+1);
                describeImage(images, index + 1);
              }
            });
          }
          describeImage(images, 0);
        }
      })
  }
  console.log({ errors })


  return (
  <Layout>
    <div className={styles.center}>
      <div className={styles.textCenter}>
        <div className={styles.instructions}>To generate descriptions for Creative Growth artists' work, please:</div>
        
        <div className={styles.instructionList}>
          <div>{botEmailCopied ? "👍" : "☝️" } Add <CopyToClipboard text={`image-describer@creative-growth-gallery-bot.iam.gserviceaccount.com`}
          onCopy={() => {setBotEmailCopied(true)}}><span className={ styles.botEmail }>the bot email 📋</span></CopyToClipboard> to your spreadsheet, with editor permissions</div>
          
          <div>{spreadsheetUrlPasted ? "👍" : "✌️" } Paste the URL of that spreadsheet into the box below</div> 
          <div>{describeArtClicked ? "👍" : "🫵" } Hit the "Describe art" button</div>

          <div className={ styles.actionPane }>
            <div style={{ display: imageCount > 0 ? "none" : "block" }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <input id="spreadsheet" {...register("spreadsheet")} type="text" onChange={() => {setSpreadsheetUrlPasted(true); }} className={ styles.spreadsheet }></input> 
                <input type="submit" value="Describe art!" />
              </form>
            </div>
            <div>{ errorMsg }</div>
            <div>{ metaMsg }</div>
            <div>
              {imageCount > 0 && <CircularProgressbar className={styles.progress} value={describedCount} maxValue={imageCount} text={describedCount} />}
            
            </div> 
          </div>
        </div> 
        
      </div>
    </div>
  </Layout>
)}

export const Head = () => <Seo title="Home" />

export default IndexPage
