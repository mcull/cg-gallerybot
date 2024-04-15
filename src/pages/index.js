import React, { useState, useEffect } from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { set, useForm } from "react-hook-form"
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
  const [describedImages, setDescribedImages] = useState([]);
 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = data => {
    setDescribeArtClicked(true);
    setErrorMsg("");
    const spreadsheet = data.spreadsheet;
    const sheet = data.sheet;
    if (!spreadsheet || !spreadsheet.length) {
      setErrorMsg("spreadsheet can't be empty");
      return;
    } else {
      const regex = /\/d\/(.*)\//;
      let id = spreadsheet.match(regex);
      if (!id || !id.length) {
        setErrorMsg("no id found in spreadsheet. Should look like https://docs.google.com/spreadsheets/d/[letters-and-numbers]/");
        return;
      }  else {
        id = id[1];
      }
      fetch(`/api/images`, {
        method: `POST`,
        body: JSON.stringify({spreadsheet: id, sheet: sheet}),
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
            const descriptionCol = body.descriptionCol;
            const imageRow = body.imageRow;
            setMetaMsg(`${imageCount} images found. Total time to describe approx ${Math.round(imageCount/5)} minutes.`);
            setImageCount(imageCount);
  
            const describeImage = (images, index) => {
              if (index >= images.length) { return; }
              const image = images[index];
              
              describedImages.push({description: '⚙️ PROCESSING...', url: image.imageUrl});
              setDescribedImages(describedImages); 
              setDescribedCount(describedImages.length); 
              
              fetch(`/api/describe`, {
                method: `POST`,
                body: JSON.stringify({  image: image, 
                                        descriptionCol: descriptionCol,
                                        spreadsheet: id,
                                        sheet: sheet
                                      }),
                headers: {
                  "content-type": `application/json`,
                },
              })
              .then(res => res.json())
              .then(body => {
                if (body.error) {
                  setErrorMsg(`Error describing image ${index + 1}, moving to the next one: ${body.error}`);
                } else {
                  describedImages[describedImages.length-1].description = body.message;
                  setDescribedImages(describedImages); 
                }
                describeImage(images, index + 1);
              });
            }
            describeImage(images, 0);
          }
        })
    }
  }

  const imageList = () => {
 
    return (
      <div className={styles.imageList}>
        {describedImages.map((image, index) => {
          return (
          
          <div className={styles.imageListItem} key={index}>
            <div className={styles.imageContainer}>
              <img className={styles.imageToDescribe} src={image.url} />
            </div>
            <div className={styles.description}>{image.description}</div>
          </div>
        )})}
      </div>
    );
  }

  return (
  <Layout>
    <div className={styles.center}>
      <div className={styles.textCenter}>
        <div className={styles.instructions}>To generate descriptions for Creative Growth artists' work, please:</div>
        
        <div className={styles.instructionList}>
          <div>{botEmailCopied ? "👍" : "☝️" } Add <CopyToClipboard text={`image-describer@creative-growth-gallery-bot.iam.gserviceaccount.com`}
          onCopy={() => {setBotEmailCopied(true)}}><span className={ styles.botEmail }>the bot email 📋</span></CopyToClipboard> to your spreadsheet, with editor permissions</div>
          
          <div>{spreadsheetUrlPasted ? "👍" : "✌️" } Paste the URL of that spreadsheet into the form below, and tab name if the images aren't in the first tab</div> 
          <div>{describeArtClicked ? "👍" : "🫵" } Hit the "Describe art" button</div>

          <div className={ styles.actionPane }>
            <div style={{ display: imageCount > 0 ? "none" : "block" }}>
              <form onSubmit={handleSubmit(onSubmit)}>
               <label >Spreadsheet</label>
               <input className={styles.formRow} id="spreadsheet" {...register("spreadsheet", {required: true, pattern: /\/d\/(.*)\//})} type="text" onChange={() => {setSpreadsheetUrlPasted(true); }} className={ styles.spreadsheet } placeholder="https://docs.google.com/spreadsheets/d/[letters-and-numbers]/"></input> 
               <label className={styles.formRow}>Tab</label>  
               <input className={styles.formRow} id="sheet" {...register("sheet")} type="text" placeholder="Tab name (optional)"></input>
                <button type="submit" className={styles.button}>Describe art</button>
              </form>
            </div>
            <div className={styles.error}>{ errorMsg }</div>
            <div>{ metaMsg }</div>
            <div className={styles.progress}>
              {imageCount > 0 && <CircularProgressbar className={styles.progress} value={describedCount} maxValue={imageCount} text={describedCount} />}
            </div>
            <div className={styles.progressRow}>
              
              <div>{imageList()}</div>
            </div> 
          </div>
        </div> 
        
      </div>
    </div>
  </Layout>
)}

export const Head = () => <Seo title="Home" />

export default IndexPage
