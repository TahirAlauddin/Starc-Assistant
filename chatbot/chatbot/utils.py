import nltk
from nltk.stem.porter import PorterStemmer
import numpy as np

stemmer = PorterStemmer()


# Function to tokenize a sentence
def tokenize(sentence):
    return nltk.word_tokenize(sentence)

# Function to stem a word
def stem(word):
    return stemmer.stem(word.lower())

# Function to get all the words from a tokenized sentences
def bag_of_words(tokenized_sentences, all_words):
    tokenized_sentence = [words for words in tokenized_sentences]
    
    bow = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        if w in tokenized_sentence:
            bow[idx] = 1.0
            
    
    return bow


if __name__ == '__main__':
    pass