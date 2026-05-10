import { useState } from 'react'

function App() {
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState(null);

  const buscarAula = async () => {
    if (!nome.trim()) return alert("Por favor, digite um nome!");
    
    setCarregando(true);
    setResultado(null);
    setErroApi(null);

    try {
      const response = await fetch('http://localhost:3001/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, url })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detalhes || "Erro no servidor.");
      
      setResultado(data);
    } catch (error) {
      setErroApi(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon}>🎯</div>
        <h1 style={styles.title}>Minha Escala AESP</h1>
        <p style={styles.subtitle}>Consulta isolada e precisa de horários.</p>
      </div>

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nome Completo do Instrutor/Aluno:</label>
          <input 
            style={styles.input}
            type="text" 
            placeholder="Ex: JANO EMANUEL MARINHO" 
            value={nome || ''} 
            onChange={(e) => setNome(e.target.value.toUpperCase())} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Link da Escala (Opcional):</label>
          <input 
            style={styles.input}
            type="text" 
            placeholder="Cole o link aqui..." 
            value={url || ''} 
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button 
          onClick={buscarAula} 
          disabled={carregando}
          style={{...styles.button, backgroundColor: carregando ? '#95a5a6' : '#2980b9'}}
        >
          {carregando ? '⏳ Extraindo dados...' : 'Consultar Escala'}
        </button>
      </div>

      {erroApi && (
        <div style={styles.errorCard}>
          <strong>Erro:</strong> {erroApi}
        </div>
      )}

      {resultado?.encontrado && (
        <div style={{...styles.card, marginTop: '30px', padding: '0'}}>
          <div style={styles.tableHeader}>
            <h3 style={{margin: 0}}>📋 Aulas de {nome}</h3>
          </div>
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Horário</th>
                  <th style={styles.th}>Disciplina / Professor</th>
                  <th style={styles.th}>Info Extra</th>
                </tr>
              </thead>
              <tbody>
                {resultado.dados.map((aula, index) => (
                  <tr key={index} style={index % 2 === 0 ? {} : styles.rowAlt}>
                    <td style={styles.tdCentralizado}>{aula.data || '---'}</td>
                    <td style={styles.tdDestaque}>{aula.horario || '---'}</td>
                    <td style={styles.tdValue}>{aula.disciplina || '---'}</td>
                    <td style={styles.tdCentralizado}>{aula.extra || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resultado?.encontrado === false && (
        <div style={styles.errorCard}>
          Nenhum horário isolado encontrado para <strong>{nome}</strong>.
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '40px 20px', fontFamily: '"Segoe UI", Roboto, sans-serif', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh', color: '#333' },
  header: { textAlign: 'center', marginBottom: '30px' },
  icon: { fontSize: '50px', marginBottom: '5px' },
  title: { fontSize: '2rem', color: '#2c3e50', margin: '0' },
  subtitle: { color: '#7f8c8d' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#34495e' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccd1d1', boxSizing: 'border-box', fontSize: '15px' },
  button: { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' },
  tableHeader: { backgroundColor: '#2980b9', color: 'white', padding: '15px', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8f9fa', padding: '12px', textAlign: 'left', fontSize: '13px', color: '#7f8c8d', borderBottom: '2px solid #eee' },
  tdCentralizado: { padding: '15px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 'bold', color: '#2c3e50' },
  tdDestaque: { padding: '15px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 'bold', color: '#16a085' },
  tdValue: { padding: '15px', borderBottom: '1px solid #eee', color: '#444', lineHeight: '1.4' },
  rowAlt: { backgroundColor: '#f9fbfb' },
  errorCard: { marginTop: '20px', padding: '15px', backgroundColor: '#fdecea', color: '#e74c3c', borderRadius: '8px', textAlign: 'center', border: '1px solid #fadbd8' }
}

export default App