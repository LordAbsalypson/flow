import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle, Info } from 'lucide-react';

export const GdprInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 gap-8 max-w-4xl mx-auto w-full pb-12">
      <div className="flex justify-start">
        <button 
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:bg-gray-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
          Back
        </button>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl flex flex-col gap-8">
        <div className="flex items-center gap-4 border-b-2 border-gray-100 pb-6">
          <ShieldCheck size={48} className="text-blue-500" />
          <h2 className="text-4xl md:text-5xl font-bold">Data Privacy & GDPR Guide</h2>
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="text-3xl font-bold flex items-center gap-2">
            <Info size={32} className="text-blue-500" /> 
            For Social Workers / Presenters
          </h3>
          <p className="text-xl text-gray-700 leading-relaxed">
            This application is designed with privacy-first principles for use in social institutions. 
            <strong> No personally identifiable information (PII)</strong> such as names, emails, or birth dates is collected.
            However, because we use cookies/local storage to save anonymous session IDs (UUIDs) and process ratings, 
            you must inform the participants before they use the app.
          </p>
        </section>

        <section className="bg-blue-50 p-6 rounded-3xl flex flex-col gap-4 border-2 border-blue-100">
          <h3 className="text-2xl font-bold text-blue-800">Text to Read Aloud (Consent Script)</h3>
          <p className="text-xl text-blue-900 leading-relaxed italic">
            "Before we start, please know that this app is safe. It does not know your name or who you are. 
            When you vote, the app remembers your vote using a random secret code on your phone. 
            By clicking 'OK' or 'Privacy Info' on your phone, you agree to play along. 
            If you don't want to play, that's completely fine too!"
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <h3 className="text-3xl font-bold">Step-by-Step Tutorial</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">1</div>
              <div>
                <h4 className="text-2xl font-bold">Read the Script</h4>
                <p className="text-xl text-gray-600">Read the consent script above to all participants before they scan the QR code.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">2</div>
              <div>
                <h4 className="text-2xl font-bold">Select a Song</h4>
                <p className="text-xl text-gray-600">On the main screen, choose how to pick a song: completely random, based on a specific mood, or by searching for a specific title/artist.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">3</div>
              <div>
                <h4 className="text-2xl font-bold">Scan the QR Code</h4>
                <p className="text-xl text-gray-600">Participants scan the QR code on the main screen using their smartphones or tablets.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">4</div>
              <div>
                <h4 className="text-2xl font-bold">Accept Privacy Notice</h4>
                <p className="text-xl text-gray-600">On their mobile device, participants can click the "Privacy Info" link at the bottom to read the simplified GDPR notice and click "OK".</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">5</div>
              <div>
                <h4 className="text-2xl font-bold">Start Voting</h4>
                <p className="text-xl text-gray-600">Participants can now safely rate songs and select emojis. All data is anonymous and tied only to their device's session.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shrink-0">6</div>
              <div>
                <h4 className="text-2xl font-bold">Discuss</h4>
                <p className="text-xl text-gray-600">After listening to the song and voting, use the results on the main screen to start a discussion with the participants about their feelings and the song's meaning.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 mt-4 border-t-2 border-gray-100 pt-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle size={28} className="text-green-500" />
            DSGVO / GDPR Compliance Details
          </h3>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-2 ml-2">
            <li><strong>Data Minimization:</strong> Only anonymous UUIDs, ratings (1-5), and emoji selections are processed.</li>
            <li><strong>Library Storage:</strong> The general rating and emoji data for each song is saved on the server for the Library feature. However, this data is <strong>never</strong> connected to the individual user's UUID in the library view. It is completely anonymous.</li>
            <li><strong>No PII:</strong> No names, IP addresses (stored by us), or accounts are required.</li>
            <li><strong>Local Storage:</strong> UUIDs are stored in the browser's LocalStorage. Deleting browser data removes the UUID.</li>
            <li><strong>Third Parties:</strong> Google Gemini API is used for song data, but no user ratings or UUIDs are sent to Google.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
