import { useEffect, useState } from 'react';
import './App.css'
import { Button } from './Button'
import lottery from './lottery';
import web3 from './web3';

function App() {
  const [manager, setManager] = useState<string>()
  const [players, setPlayers] = useState<string[]>([])
  const [balance, setBalance] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [tx, setTx] = useState<any>()

  const onSubmit = async (event: any) => {
    event.preventDefault()
    setIsSending(true)
    setMessage('Waiting on transaction success...')
    setTx('')
    try {
      const accounts = await web3.eth.getAccounts()
      const tx = await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, 'ether'),
      })
      setTx(tx)
      setIsSending(false)
      setMessage('You have been entered!')
    } catch (error: any) {
      setMessage(() => {
        if (error.message) {
          return error.message
        }
        return 'Unknown error'
      })
      setIsSending(false)
    }
  }

  const handleChangeInput = (event: any) => {
    setValue(() => event.target.value)
  }

  const onPickWinner = async () => {
    setIsSending(true)
    setMessage('Waiting on transaction success...')
    setTx('')
    try {
      const accounts = await web3.eth.getAccounts()
      const tx = await lottery.methods.pickWinner().send({
        from: accounts[0],
      })
      setTx(tx)
      setIsSending(false)
      setMessage('A winner has been picked!')
    } catch (error: any) {
      setMessage(() => {
        if (error.message) {
          return error.message
        }
        return 'Unknown error'
      })
      setIsSending(false)
    }
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
        <h4>Want to try your luck?</h4>
        <form onSubmit={onSubmit}>
          <div>
            <label className="app__label">Amount of ether to enter</label>
            <input
              className="app__input"
              type="text"
              value={value}
              onChange={handleChangeInput}
            />
            <em>eth</em>
          </div>
          <Button
            type="submit"
            disabled={isSending}
          >Enter</Button>
        </form>
        <hr className="app__separator" />
        <h4>Ready to pick a winner?</h4>
        <br />
        <Button
          type="button"
          disabled={isSending}
          onClick={onPickWinner}
        >Pick a winner!</Button>
        <hr className="app__separator" />
        {message && (
          <>
            <br />
            <h2>{message}</h2>
          </>
        )}
        <hr className="app__separator" />
        <h3>Tx</h3>
        <br />
        <code
          className="app__code"
        >{JSON.stringify(tx)}</code>
      </main>
    </div>
  );
}

export default App
