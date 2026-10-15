import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  Play,
  Square,
  Bot,
  User,
  Compass,
  Loader2,
  Wand2,
} from 'lucide-react';
import type { ChatMessage } from '../../types';

interface ChatGuidePanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectPOIName: (poiName: string) => void;
  onPlaySpeech: (text: string) => void;
  onStopSpeech: () => void;
  isSpeaking: boolean;
  audioScript: string | null;
}

const QUICK_PROMPTS = [
  '🏛️ 3 monuments majeurs et leur histoire secrète',
  '☕ Meilleurs cafés et boulangeries traditionnelles',
  '🚶 Circuit d’une journée à pied avec temps de marche',
  '✨ Lieux insolites et secrets hors des sentiers battus',
  '🍷 Dîner romantique avec spécialités régionales',
];

export const ChatGuidePanel: React.FC<ChatGuidePanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectPOIName,
  onPlaySpeech,
  onStopSpeech,
  isSpeaking,
  audioScript,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Panel Top Bar */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(14, 21, 36, 0.95)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Bot size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
                Guide Culturel IA
              </h3>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0 }}>
              Orchestrateur Grok & MCP Geoapify
            </p>
          </div>
        </div>

        {/* Audio Player Widget */}
        {audioScript && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSpeaking ? (
              <button
                onClick={onStopSpeech}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#F43F5E', color: '#F43F5E' }}
                title="Arrêter la voix"
              >
                <Square size={13} fill="#F43F5E" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => onPlaySpeech(audioScript)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#06B6D4', color: '#06B6D4' }}
                title="Écouter la narration audio"
              >
                <Play size={13} fill="#06B6D4" />
                <span>Audio Guide</span>
              </button>
            )}

            {isSpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '18px' }}>
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div
              className="glass-card"
              style={{
                padding: '18px',
                borderLeft: '4px solid #06B6D4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={20} color="#06B6D4" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Bienvenue, voyageur curieux !
                </h4>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                Je suis votre guide personnel intelligent. Je combine les capacités de raisonnement de
                <strong> Grok</strong> et les données spatiales officielles de <strong>Geoapify</strong> pour vous
                créer des visites culturelles d'exception, avec carte interactive et audio-guide immersif.
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '8px' }}>
                💡 Suggestions d'inspiration :
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="glass-card"
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      color: '#E2E8F0',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                    }}
                  >
                    <Wand2 size={14} color="#06B6D4" style={{ flexShrink: 0 }} />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isUser
                      ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                      : 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isUser ? <User size={16} color="#fff" /> : <Bot size={16} color="#fff" />}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '85%',
                    background: isUser ? '#1E293B' : 'rgba(22, 32, 53, 0.85)',
                    border: '1px solid ' + (isUser ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'),
                    borderRadius: '14px',
                    padding: '12px 16px',
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                    color: '#F1F5F9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Tool Call Indicators */}
                  {!isUser && msg.metadata?.tool_calls && msg.metadata.tool_calls.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {msg.metadata.tool_calls.map((tc, tcIdx) => (
                        <span
                          key={tcIdx}
                          style={{
                            background: 'rgba(6, 182, 212, 0.12)',
                            color: '#06B6D4',
                            border: '1px solid rgba(6, 182, 212, 0.25)',
                            borderRadius: '8px',
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Compass size={10} />
                          {tc.tool.replace('geoapify_', '')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Text with basic markdown simulation */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {formatMarkdownContent(msg.content, onSelectPOIName)}
                  </div>

                  {/* Audio Play Trigger for this message */}
                  {!isUser && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => onPlaySpeech(msg.metadata?.audio_script || msg.content)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#06B6D4',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        <Volume2 size={13} />
                        <span>Écouter la narration</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={16} color="#fff" />
            </div>
            <div
              className="glass-card"
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: '#94A3B8',
              }}
            >
              <Loader2 size={16} className="animate-spin" color="#06B6D4" />
              <span>Grok consulte Geoapify et planifie la visite...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(14, 21, 36, 0.95)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Posez une question ou demandez un itinéraire au guide..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#F8FAFC',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="btn-primary"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            opacity: isLoading || !inputText.trim() ? 0.5 : 1,
          }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

// Formatter to enhance POI names into clickable tags
function formatMarkdownContent(text: string, onSelectPOIName: (name: string) => void) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} style={{ fontSize: '0.98rem', fontWeight: 700, color: '#06B6D4', margin: '8px 0 4px 0' }}>
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC', margin: '10px 0 6px 0' }}>
          {line.replace('## ', '')}
        </h3>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const content = line.substring(2);
      return (
        <div key={idx} style={{ display: 'flex', gap: '6px', margin: '3px 0', alignItems: 'baseline' }}>
          <span style={{ color: '#06B6D4' }}>&bull;</span>
          <span>{renderInlineBold(content, onSelectPOIName)}</span>
        </div>
      );
    }
    return (
      <p key={idx} style={{ margin: '4px 0' }}>
        {renderInlineBold(line, onSelectPOIName)}
      </p>
    );
  });
}

function renderInlineBold(text: string, onSelectPOIName: (name: string) => void) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const clean = part.slice(2, -2);
      return (
        <strong
          key={pIdx}
          onClick={() => onSelectPOIName(clean)}
          style={{
            color: '#F8FAFC',
            cursor: 'pointer',
            borderBottom: '1px dashed rgba(6, 182, 212, 0.5)',
          }}
          title="Cliquer pour localiser sur la carte"
        >
          {clean}
        </strong>
      );
    }
    return part;
  });
}
