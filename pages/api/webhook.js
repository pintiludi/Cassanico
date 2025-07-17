import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido');

  try {
    const evento = req.body;

    if (evento.type === 'payment' && evento.data?.id) {
      const paymentID = evento.data.id;

      const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentID}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_TOKEN}`
        }
      });

      const pagamento = await resposta.json();

      if (pagamento.status === 'approved') {
        const valorPago = pagamento.transaction_amount;
        const token = pagamento.metadata?.simbolo;

        if (!token) return res.status(400).send('Token ausente');

        const filePath = path.join(process.cwd(), 'public', 'jogadores.json');
        let jogadores = {};

        if (fs.existsSync(filePath)) {
          jogadores = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        const pontos = valorPago * 2;

        if (!jogadores[token]) jogadores[token] = 0;
        jogadores[token] += pontos;

        fs.writeFileSync(filePath, JSON.stringify(jogadores, null, 2));

        return res.status(200).send('Pontos adicionados com sucesso');
      }
    }

    res.status(200).send('Evento ignorado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno no Webhook');
  }
}
