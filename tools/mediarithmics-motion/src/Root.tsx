import "./studio.css";
import { MyComposition } from "./Composition";
import {Composition} from 'remotion';
import {AudienceFlow, RetailFlow, IdentityLoop, AmbientArtwork} from './Scenes';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition id="AudienceWalkthrough" component={AudienceFlow} width={600} height={110} fps={30} durationInFrames={450}/>
      <Composition id="RetailJourney" component={RetailFlow} width={720} height={440} fps={30} durationInFrames={360}/>
      <Composition id="IdentityLoop" component={IdentityLoop} width={720} height={440} fps={30} durationInFrames={120}/>
      <Composition id="BrandArtwork" component={AmbientArtwork} width={720} height={400} fps={30} durationInFrames={240} defaultProps={{source:'retail.svg'}}/>
    </>
  );
};
