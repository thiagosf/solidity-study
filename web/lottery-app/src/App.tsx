import { useEffect, useState } from 'react';
import './App.css'
import { Button } from './Button'
import lottery from './lottery';
import web3 from './web3';

function App() {
  const [manager, setManager] = useState<string>()
  const [players, setPlayers] = useState<string[]>([])
  const [balance, setBalance] = useState<string>('')

  const onEnter = async () => {
    console.log('onEnter')
  }

  useEffect(() => {
    lottery.methods.manager().call()
      .then((_manager: string) => {
        setManager(_manager)
      })

    lottery.methods.getPlayers().call()
      .then((_players: string[]) => {
        setPlayers(_players)
      })

    web3.eth.getBalance(lottery.options.address)
      .then((_balance: string) => {
        setBalance(_balance)
      })
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        <h1>Lottery Contract</h1>
        <p>This contract is managed by {manager}</p>
        <p>There are currently {players.length} people entered, competing to win {web3.utils.fromWei(balance, 'ether')} ether!</p>
      </header>
      <main>
        <Button onClick={onEnter}>Enter</Button>
      </main>
    </div>
  );
}

export default App
